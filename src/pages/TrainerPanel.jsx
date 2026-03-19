import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaDumbbell, FaCalendarAlt } from 'react-icons/fa';
import ExerciseModal from '../components/modals/ExerciseModal';
import WorkoutModal from '../components/modals/WorkoutModal';
import styles from './TrainerPanel.module.css';

const TrainerPanel = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('exercise');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Загрузка данных тренера...');
      
      const [exercisesRes, workoutsRes] = await Promise.all([
        api.get('/api/exercises/my'),
        api.get('/api/workouts/my')
      ]);
      
      const exercisesData = Array.isArray(exercisesRes.data) ? exercisesRes.data : [];
      const workoutsData = Array.isArray(workoutsRes.data) ? workoutsRes.data : [];
      
      setExercises(exercisesData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Ошибка загрузки данных');
      setExercises([]);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Удалить это упражнение?')) return;
    
    try {
      await api.delete(`/api/exercises/${id}`);
      toast.success('Упражнение удалено');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Ошибка при удалении');
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Удалить эту тренировку?')) return;
    
    try {
      await api.delete(`/api/workouts/${id}`);
      toast.success('Тренировка удалена');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Ошибка при удалении');
    }
  };

  const handleItemSaved = (savedItem) => {
    if (modalType === 'exercise') {
      if (selectedItem) {
        setExercises(prev => prev.map(ex => ex.id === savedItem.id ? savedItem : ex));
      } else {
        setExercises(prev => [savedItem, ...prev]);
      }
    } else {
      if (selectedItem) {
        setWorkouts(prev => prev.map(w => w.id === savedItem.id ? savedItem : w));
      } else {
        setWorkouts(prev => [savedItem, ...prev]);
      }
    }
    setModalOpen(false);
    setSelectedItem(null);
  };

  const openExerciseModal = (exercise = null) => {
    setModalType('exercise');
    setSelectedItem(exercise);
    setModalOpen(true);
  };

  const openWorkoutModal = (workout = null) => {
    setModalType('workout');
    setSelectedItem(workout);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const allItems = [
    ...exercises.map(ex => ({ 
      ...ex, 
      type: 'exercise', 
      icon: <FaDumbbell />,
      created: new Date(ex.createdAt || Date.now()).getTime()
    })),
    ...workouts.map(w => ({ 
      ...w, 
      type: 'workout', 
      icon: <FaCalendarAlt />,
      created: new Date(w.createdAt || Date.now()).getTime()
    }))
  ].sort((a, b) => (b.created || 0) - (a.created || 0));

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мои материалы</h1>
        <div className={styles.buttons}>
          <button onClick={() => openExerciseModal()} className={styles.addButton}>
            <FaPlus size={14} />
            Упражнение
          </button>
          <button onClick={() => openWorkoutModal()} className={styles.addButton}>
            <FaPlus size={14} />
            Тренировка
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : allItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p>У вас пока нет созданных материалов</p>
          <div className={styles.emptyButtons}>
            <button onClick={() => openExerciseModal()} className={styles.emptyButton}>
              Создать упражнение
            </button>
            <button onClick={() => openWorkoutModal()} className={styles.emptyButton}>
              Создать тренировку
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {allItems.map(item => (
            <div key={`${item.type}-${item.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleContainer}>
                  <div className={styles.list_icons}><span className={styles.cardIcon}>{item.icon}</span>
                    <h3 className={styles.cardTitle}>{item.name || 'Без названия'}</h3></div>
                  <div>
                    <span className={styles.cardType}>
                      {item.type === 'exercise' ? 'Упражнение' : 'Тренировка'}
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button 
                    onClick={() => item.type === 'exercise' 
                      ? openExerciseModal(item) 
                      : openWorkoutModal(item)
                    }
                    className={styles.editButton}
                    title="Редактировать"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    onClick={() => item.type === 'exercise' 
                      ? handleDeleteExercise(item.id) 
                      : handleDeleteWorkout(item.id)
                    }
                    className={styles.deleteButton}
                    title="Удалить"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <p className={styles.description}>
                  {item.description || 'Нет описания'}
                </p>
                
                <div className={styles.tags}>
                  {item.type === 'exercise' ? (
                    <>
                      <span className={styles.tag}>
                        {item.category === 'strength' ? 'Силовое' : 
                         item.category === 'cardio' ? 'Кардио' : 
                         item.category === 'stretching' ? 'Растяжка' : 'Другое'}
                      </span>
                      <span className={styles.tag}>
                        {item.difficulty === 'beginner' ? 'Новичок' : 
                         item.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                      </span>
                      {item.muscleGroup && (
                        <span className={styles.tag}>{item.muscleGroup}</span>
                      )}
                      {item.rutubeVideoId && (
                        <span className={styles.tag}>Видео</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className={styles.tag}>{item.duration || 0} мин</span>
                      <span className={styles.tag}>
                        {item.level === 'beginner' ? 'Новичок' : 
                         item.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                      </span>
                      {item.category && (
                        <span className={styles.tag}>{item.category}</span>
                      )}
                      <span className={styles.tag}>{item.exercises?.length || 0} упр</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalType === 'exercise' ? (
        <ExerciseModal
          isOpen={modalOpen}
          onClose={closeModal}
          exercise={selectedItem}
          onSave={handleItemSaved}
        />
      ) : (
        <WorkoutModal
          isOpen={modalOpen}
          onClose={closeModal}
          workout={selectedItem}
          onSave={handleItemSaved}
        />
      )}
    </div>
  );
};

export default TrainerPanel;