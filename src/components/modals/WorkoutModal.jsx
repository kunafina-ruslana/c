import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash, FaDumbbell, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './WorkoutModal.module.css';

const WorkoutModal = ({ isOpen, onClose, workout, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    level: 'beginner',
    category: '',
    imageUrl: '',
    exercises: []
  });
  
  const [allExercises, setAllExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [restTime, setRestTime] = useState(30);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllExercises();
    }
  }, [isOpen]);

  useEffect(() => {
    if (workout) {
      setFormData({
        name: workout.name || '',
        description: workout.description || '',
        duration: workout.duration || '',
        level: workout.level || 'beginner',
        category: workout.category || '',
        imageUrl: workout.imageUrl || '',
        exercises: workout.exercises?.map(ex => ({
          exerciseId: ex.id,
          name: ex.name,
          category: ex.category,
          muscleGroup: ex.muscleGroup,
          difficulty: ex.difficulty,
          sets: ex.WorkoutExercise?.sets || 3,
          reps: ex.WorkoutExercise?.reps || 10,
          restTime: ex.WorkoutExercise?.restTime || 30
        })) || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: '',
        level: 'beginner',
        category: '',
        imageUrl: '',
        exercises: []
      });
    }
    setErrors({});
  }, [workout, isOpen]);

  useEffect(() => {
    // Фильтрация упражнений
    let filtered = [...allExercises];
    
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.muscleGroup && ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty);
    }
    
    setFilteredExercises(filtered);
  }, [allExercises, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchAllExercises = async () => {
    try {
      const response = await api.get('/api/exercises');
      setAllExercises(Array.isArray(response.data) ? response.data : []);
      setFilteredExercises(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Ошибка загрузки упражнений');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }
    
    if (!formData.duration) {
      newErrors.duration = 'Длительность обязательна';
    } else {
      const durationNum = Number(formData.duration);
      if (isNaN(durationNum) || durationNum <= 0) {
        newErrors.duration = 'Длительность должна быть положительным числом';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    setLoading(true);
    
    try {
      const workoutData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration),
        level: formData.level,
        category: formData.category?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        exercises: formData.exercises.map(({ exerciseId, sets, reps, restTime }) => ({
          exerciseId,
          sets,
          reps,
          restTime
        }))
      };

      let response;
      if (workout) {
        response = await api.put(`/api/workouts/${workout.id}`, workoutData);
        toast.success('Тренировка успешно обновлена');
      } else {
        response = await api.post('/api/workouts', workoutData);
        toast.success('Тренировка успешно создана');
      }
      
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const addExercise = () => {
    if (!selectedExercise) {
      toast.error('Выберите упражнение');
      return;
    }

    const exists = formData.exercises.some(ex => ex.exerciseId === selectedExercise.id);
    if (exists) {
      toast.error('Это упражнение уже добавлено');
      return;
    }

    const newExercise = {
      exerciseId: selectedExercise.id,
      name: selectedExercise.name,
      category: selectedExercise.category,
      muscleGroup: selectedExercise.muscleGroup,
      difficulty: selectedExercise.difficulty,
      sets,
      reps,
      restTime
    };

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    setSelectedExercise(null);
    setSearchTerm('');
    setSets(3);
    setReps(10);
    setRestTime(30);
  };

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const updateExercise = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const getUniqueCategories = () => {
    const categories = allExercises.map(ex => ex.category).filter(Boolean);
    return ['all', ...new Set(categories)];
  };

  const getDifficultyLabel = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 'Новичок';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return difficulty;
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'strength': return '💪 Силовое';
      case 'cardio': return '❤️ Кардио';
      case 'stretching': return '🧘 Растяжка';
      case 'other': return '📌 Другое';
      default: return category;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {workout ? 'Редактировать тренировку' : 'Создать тренировку'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formContent}>
            {/* Основная информация о тренировке */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Основная информация</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Название *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Например: Утренняя тренировка"
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Описание *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                  rows="3"
                  placeholder="Опишите цели тренировки"
                />
                {errors.description && <span className={styles.error}>{errors.description}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Длительность (мин) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.duration ? styles.inputError : ''}`}
                    min="1"
                    max="300"
                  />
                  {errors.duration && <span className={styles.error}>{errors.duration}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Уровень</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="beginner">Новичок</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Категория</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Например: Силовая, Кардио"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>URL изображения</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Выбор упражнений */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Упражнения {formData.exercises.length > 0 && `(${formData.exercises.length})`}
              </h3>
              
              {/* Фильтры для упражнений */}
              <div className={styles.filters}>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Поиск упражнений..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                
                <div className={styles.filterRow}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Все категории</option>
                    <option value="strength">Силовые</option>
                    <option value="cardio">Кардио</option>
                    <option value="stretching">Растяжка</option>
                    <option value="other">Другое</option>
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Все уровни</option>
                    <option value="beginner">Новичок</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>
              </div>

              {/* Список доступных упражнений */}
              <div className={styles.exercisesList}>
                {filteredExercises.length === 0 ? (
                  <div className={styles.noExercises}>
                    Упражнения не найдены
                  </div>
                ) : (
                  filteredExercises.map(ex => (
                    <div 
                      key={ex.id} 
                      className={`${styles.exerciseCard} ${selectedExercise?.id === ex.id ? styles.selected : ''}`}
                      onClick={() => setSelectedExercise(ex)}
                    >
                      <div className={styles.exerciseCardHeader}>
                        <FaDumbbell className={styles.exerciseCardIcon} />
                        <span className={styles.exerciseCardName}>{ex.name}</span>
                      </div>
                      <div className={styles.exerciseCardTags}>
                        <span className={styles.exerciseTag}>{getCategoryLabel(ex.category)}</span>
                        <span className={styles.exerciseTag}>{getDifficultyLabel(ex.difficulty)}</span>
                        {ex.muscleGroup && (
                          <span className={styles.exerciseTag}>🎯 {ex.muscleGroup}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Настройка параметров выбранного упражнения */}
              {selectedExercise && (
                <div className={styles.exerciseConfig}>
                  <h4 className={styles.configTitle}>Настройка: {selectedExercise.name}</h4>
                  <div className={styles.configRow}>
                    <div className={styles.configGroup}>
                      <label>Подходы</label>
                      <input
                        type="number"
                        value={sets}
                        onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                        min="1"
                        className={styles.configInput}
                      />
                    </div>
                    <div className={styles.configGroup}>
                      <label>Повторения</label>
                      <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                        min="1"
                        className={styles.configInput}
                      />
                    </div>
                    <div className={styles.configGroup}>
                      <label>Отдых (сек)</label>
                      <input
                        type="number"
                        value={restTime}
                        onChange={(e) => setRestTime(parseInt(e.target.value) || 0)}
                        min="0"
                        className={styles.configInput}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={addExercise} 
                      className={styles.addExerciseButton}
                    >
                      <FaPlus /> Добавить
                    </button>
                  </div>
                </div>
              )}

              {/* Список добавленных упражнений */}
              {formData.exercises.length > 0 && (
                <div className={styles.selectedExercises}>
                  <h4 className={styles.selectedTitle}>Добавленные упражнения</h4>
                  {formData.exercises.map((ex, index) => (
                    <div key={index} className={styles.selectedExercise}>
                      <div className={styles.selectedExerciseHeader}>
                        <FaDumbbell className={styles.selectedExerciseIcon} />
                        <span className={styles.selectedExerciseName}>{ex.name}</span>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className={styles.removeButton}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className={styles.selectedExerciseDetails}>
                        <div className={styles.detailItem}>
                          <label>Подходы:</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                            min="1"
                            className={styles.detailInput}
                          />
                        </div>
                        <div className={styles.detailItem}>
                          <label>Повторения:</label>
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                            min="1"
                            className={styles.detailInput}
                          />
                        </div>
                        <div className={styles.detailItem}>
                          <label>Отдых (сек):</label>
                          <input
                            type="number"
                            value={ex.restTime}
                            onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value) || 0)}
                            min="0"
                            className={styles.detailInput}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              <FaSave size={16} />
              {loading ? 'Сохранение...' : (workout ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutModal;