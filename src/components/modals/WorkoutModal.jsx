import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash, FaDumbbell, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
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
  
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [restTime, setRestTime] = useState(30);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const categories = [
    { value: 'strength', label: 'Силовая' },
    { value: 'cardio', label: 'Кардио' },
    { value: 'stretching', label: 'Растяжка' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'yoga', label: 'Йога' },
    { value: 'pilates', label: 'Пилатес' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'bodyweight', label: 'С собственным весом' },
    { value: 'fullbody', label: 'На все тело' },
    { value: 'other', label: 'Другое' }
  ];

  const limits = {
    name: { min: 3, max: 100 },
    description: { min: 10, max: 500 },
    category: { min: 2, max: 50 },
    imageUrl: { max: 500 }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

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
    setTouched({});
  }, [workout, isOpen]);

  const fetchExercises = async () => {
    try {
      const response = await axios.get('/api/exercises');
      setAvailableExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const validateField = (name, value) => {
    if (name === 'name') {
      if (!value || !value.trim()) return 'Название обязательно';
      if (value.length < limits.name.min) return `Минимум ${limits.name.min} символа`;
      if (value.length > limits.name.max) return `Максимум ${limits.name.max} символов`;
    }
    
    if (name === 'description') {
      if (!value || !value.trim()) return 'Описание обязательно';
      if (value.length < limits.description.min) return `Минимум ${limits.description.min} символов`;
      if (value.length > limits.description.max) return `Максимум ${limits.description.max} символов`;
    }
    
    if (name === 'duration') {
      if (!value || value < 1) return 'Длительность должна быть больше 0';
      if (value > 300) return 'Максимальная длительность 300 минут';
    }
    
    if (name === 'category') {
      if (value && value.length > limits.category.max) return `Максимум ${limits.category.max} символов`;
    }
    
    if (name === 'imageUrl') {
      if (value && value.length > limits.imageUrl.max) return `URL слишком длинный (макс. ${limits.imageUrl.max} символов)`;
      if (value && !isValidUrl(value)) return 'Введите корректный URL';
    }
    
    return null;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    
    const descError = validateField('description', formData.description);
    if (descError) newErrors.description = descError;
    
    const durationError = validateField('duration', formData.duration);
    if (durationError) newErrors.duration = durationError;
    
    const categoryError = validateField('category', formData.category);
    if (categoryError) newErrors.category = categoryError;
    
    const imageUrlError = validateField('imageUrl', formData.imageUrl);
    if (imageUrlError) newErrors.imageUrl = imageUrlError;
    
    if (formData.exercises.length === 0) {
      newErrors.exercises = 'Добавьте хотя бы одно упражнение';
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
        ...formData,
        duration: parseInt(formData.duration),
        exercises: formData.exercises.map(({ exerciseId, sets, reps, restTime }) => ({
          exerciseId,
          sets,
          reps,
          restTime
        }))
      };

      let response;
      if (workout) {
        response = await axios.put(`/api/workouts/${workout.id}`, workoutData);
        toast.success('Тренировка успешно обновлена');
      } else {
        response = await axios.post('/api/workouts', workoutData);
        toast.success('Тренировка успешно создана');
      }
      
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error(error.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
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
      sets,
      reps,
      restTime
    };

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    setSelectedExercise(null);
    setSets(3);
    setReps(10);
    setRestTime(30);
    
    if (errors.exercises) {
      setErrors(prev => ({ ...prev, exercises: null }));
    }
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

  const getCharacterCountColor = (current, min, max) => {
    if (current === 0) return 'var(--text)';
    if (current < min) return 'var(--error-color)';
    if (current > max) return 'var(--error-color)';
    if (current > max * 0.9) return 'orange';
    return 'var(--success-color)';
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
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
            <div className={styles.section}>
              
              <div className={styles.formGroup}>
                <div className={styles.labelContainer}>
                  <label className={styles.label}>Название тренировки *</label>
                  <span className={styles.charCount} style={{
                    color: getCharacterCountColor(
                      formData.name.length,
                      limits.name.min,
                      limits.name.max
                    )
                  }}>
                    {formData.name.length}/{limits.name.max}
                  </span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${touched.name && errors.name ? styles.inputError : ''}`}
                  placeholder="Например: Утренняя силовая тренировка"
                  maxLength={limits.name.max}
                />
                {touched.name && errors.name ? (
                  <span className={styles.error}>{errors.name}</span>
                ) : (
                  <span className={styles.hint}>
                    Минимум {limits.name.min} символа, максимум {limits.name.max}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelContainer}>
                  <label className={styles.label}>Описание тренировки *</label>
                  <span className={styles.charCount} style={{
                    color: getCharacterCountColor(
                      formData.description.length,
                      limits.description.min,
                      limits.description.max
                    )
                  }}>
                    {formData.description.length}/{limits.description.max}
                  </span>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.textarea} ${touched.description && errors.description ? styles.inputError : ''}`}
                  rows="4"
                  placeholder="Опишите цели тренировки, какие мышцы задействованы, для кого подходит..."
                  maxLength={limits.description.max}
                />
                {touched.description && errors.description ? (
                  <span className={styles.error}>{errors.description}</span>
                ) : (
                  <span className={styles.hint}>
                    Подробное описание поможет пользователям выбрать правильную тренировку
                  </span>
                )}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Длительность (мин) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="1"
                    max="300"
                    className={`${styles.input} ${touched.duration && errors.duration ? styles.inputError : ''}`}
                  />
                  {touched.duration && errors.duration && (
                    <span className={styles.error}>{errors.duration}</span>
                  )}
                  <span className={styles.hint}>От 1 до 300 минут</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Уровень сложности</label>
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
                  <span className={styles.hint}>Для кого предназначена тренировка</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Категория тренировки</label>
                <div className={styles.categoryContainer}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${styles.select} ${touched.category && errors.category ? styles.inputError : ''}`}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {formData.category && (
                    <span className={styles.charCountSmall}>
                      {formData.category.length}/{limits.category.max}
                    </span>
                  )}
                </div>
                {touched.category && errors.category && (
                  <span className={styles.error}>{errors.category}</span>
                )}
                <span className={styles.hint}>
                  Можно выбрать из списка или ввести свою категорию
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Своя категория (если не подошла из списка)</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${touched.category && errors.category ? styles.inputError : ''}`}
                  placeholder="Например: Кроссфит, Пилатес, Бокс..."
                  maxLength={limits.category.max}
                />
                <span className={styles.hint}>
                  Введите свою категорию, если не нашли подходящую в списке
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>URL изображения (опционально)</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${touched.imageUrl && errors.imageUrl ? styles.inputError : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {touched.imageUrl && errors.imageUrl && (
                  <span className={styles.error}>{errors.imageUrl}</span>
                )}
                <span className={styles.hint}>
                  Ссылка на изображение для обложки тренировки
                </span>
                {formData.imageUrl && !errors.imageUrl && (
                  <div className={styles.imagePreview}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className={styles.previewImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        toast.error('Не удалось загрузить изображение по ссылке');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Упражнения {formData.exercises.length > 0 && 
                  <span className={styles.exerciseCount}>({formData.exercises.length})</span>
                }</h3>
                {errors.exercises && (
                  <span className={styles.errorText}>{errors.exercises}</span>
                )}
              </div>
              
              <div className={styles.exerciseSelector}>
                <div className={styles.infoBox}>
                  <FaInfoCircle size={14} />
                  <span className={styles.infoText}>
                    Выберите упражнение из каталога и настройте параметры
                  </span>
                </div>
                
                <select
                  value={selectedExercise?.id || ''}
                  onChange={(e) => {
                    const ex = availableExercises.find(ex => ex.id === parseInt(e.target.value));
                    setSelectedExercise(ex);
                  }}
                  className={styles.exerciseSelect}
                >
                  <option value="">Выберите упражнение</option>
                  {availableExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.muscleGroup || 'Без категории'})
                    </option>
                  ))}
                </select>

                <div className={styles.exerciseParams}>
                  <div className={styles.paramGroup}>
                    <label className={styles.paramLabel}>Подходы</label>
                    <input
                      type="number"
                      value={sets}
                      onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                      className={styles.paramInput}
                    />
                  </div>
                  <div className={styles.paramGroup}>
                    <label className={styles.paramLabel}>Повторения</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                      min="1"
                      max="100"
                      className={styles.paramInput}
                    />
                  </div>
                  <div className={styles.paramGroup}>
                    <label className={styles.paramLabel}>Отдых (сек)</label>
                    <input
                      type="number"
                      value={restTime}
                      onChange={(e) => setRestTime(parseInt(e.target.value) || 0)}
                      min="0"
                      max="300"
                      className={styles.paramInput}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addExercise} 
                    className={styles.addButton}
                    disabled={!selectedExercise}
                  >
                    <FaPlus size={14} />
                    Добавить
                  </button>
                </div>
              </div>

              <div className={styles.exercisesList}>
                {formData.exercises.map((ex, index) => (
                  <div key={index} className={styles.exerciseItem}>
                    <div className={styles.exerciseHeader}>
                      <FaDumbbell size={16} className={styles.exerciseIcon} />
                      <span className={styles.exerciseName}>{ex.name}</span>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className={styles.removeButton}
                        title="Удалить упражнение"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <div className={styles.exerciseDetails}>
                      <div className={styles.detailItem}>
                        <label>Подходы:</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
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
                          max="100"
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
                          max="300"
                          className={styles.detailInput}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.exercises.length === 0 && (
                  <div className={styles.emptyExercises}>
                    <p className={styles.emptyText}>Упражнения не добавлены</p>
                    <p className={styles.emptySubtext}>Выберите упражнение сверху и нажмите "Добавить"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.footerInfo}>
              <span className={styles.footerHint}>
                * Обязательные поля
              </span>
            </div>
            <div className={styles.footerButtons}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                Отмена
              </button>
              <button type="submit" disabled={loading} className={styles.saveButton}>
                {loading ? 'Сохранение...' : workout ? 'Сохранить изменения' : 'Создать тренировку'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutModal;