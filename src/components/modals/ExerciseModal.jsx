import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaVideo, FaDumbbell } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './ExerciseModal.module.css';

const ExerciseModal = ({ isOpen, onClose, exercise, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    muscleGroup: '',
    difficulty: 'beginner',
    equipment: '',
    imageUrl: '',
    rutubeFullUrl: '',
    rutubeStartTime: 0,
    rutubeEndTime: '',
    instructions: '',
    commonMistakes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        category: exercise.category || 'strength',
        muscleGroup: exercise.muscleGroup || '',
        difficulty: exercise.difficulty || 'beginner',
        equipment: exercise.equipment || '',
        imageUrl: exercise.imageUrl || '',
        rutubeFullUrl: exercise.rutubeFullUrl || '',
        rutubeStartTime: exercise.rutubeStartTime || 0,
        rutubeEndTime: exercise.rutubeEndTime || '',
        instructions: exercise.instructions || '',
        commonMistakes: exercise.commonMistakes || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'strength',
        muscleGroup: '',
        difficulty: 'beginner',
        equipment: '',
        imageUrl: '',
        rutubeFullUrl: '',
        rutubeStartTime: 0,
        rutubeEndTime: '',
        instructions: '',
        commonMistakes: ''
      });
    }
    setErrors({});
  }, [exercise, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }
    
    if (formData.rutubeFullUrl) {
      const rutubePattern = /rutube\.ru\/(video|play)\/([a-f0-9]+)/i;
      if (!rutubePattern.test(formData.rutubeFullUrl)) {
        newErrors.rutubeFullUrl = 'Неверный формат ссылки Rutube';
      }
    }
    
    if (formData.rutubeEndTime && formData.rutubeStartTime >= formData.rutubeEndTime) {
      newErrors.rutubeEndTime = 'Время окончания должно быть больше времени начала';
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
      let response;
      if (exercise) {
        response = await api.put(`/api/exercises/${exercise.id}`, formData);
        toast.success('Упражнение успешно обновлено');
      } else {
        response = await api.post('/api/exercises', formData);
        toast.success('Упражнение успешно создано');
      }
      
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving exercise:', error);
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {exercise ? 'Редактировать упражнение' : 'Создать упражнение'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'basic' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Основное
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'video' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Видео
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {activeTab === 'basic' && (
            <div className={styles.tabContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Название *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Например: Жим штанги лежа"
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
                  placeholder="Краткое описание упражнения"
                />
                {errors.description && <span className={styles.error}>{errors.description}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Категория</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="strength">Силовое</option>
                    <option value="cardio">Кардио</option>
                    <option value="stretching">Растяжка</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Сложность</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
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
                  <label className={styles.label}>Группа мышц</label>
                  <input
                    type="text"
                    name="muscleGroup"
                    value={formData.muscleGroup}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Например: Грудь, трицепс"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Инвентарь</label>
                  <input
                    type="text"
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Например: Штанга, гантели"
                  />
                </div>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>Инструкция</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Подробное описание техники выполнения..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Частые ошибки</label>
                <textarea
                  name="commonMistakes"
                  value={formData.commonMistakes}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="3"
                  placeholder="Основные ошибки при выполнении..."
                />
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className={styles.tabContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ссылка на видео Rutube</label>
                <input
                  type="text"
                  name="rutubeFullUrl"
                  value={formData.rutubeFullUrl}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.rutubeFullUrl ? styles.inputError : ''}`}
                  placeholder="https://rutube.ru/video/..."
                />
                {errors.rutubeFullUrl && <span className={styles.error}>{errors.rutubeFullUrl}</span>}
                <small className={styles.hint}>
                  Пример: https://rutube.ru/video/1234567890abcdef/
                </small>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Время начала (сек)</label>
                  <input
                    type="number"
                    name="rutubeStartTime"
                    value={formData.rutubeStartTime}
                    onChange={handleChange}
                    min="0"
                    className={styles.input}
                  />
                  <small className={styles.hint}>С какого момента начать</small>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Время окончания (сек)</label>
                  <input
                    type="number"
                    name="rutubeEndTime"
                    value={formData.rutubeEndTime}
                    onChange={handleChange}
                    min="0"
                    className={`${styles.input} ${errors.rutubeEndTime ? styles.inputError : ''}`}
                  />
                  {errors.rutubeEndTime && <span className={styles.error}>{errors.rutubeEndTime}</span>}
                  <small className={styles.hint}>Оставьте пустым для всего видео</small>
                </div>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Сохранение...' : exercise ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseModal;