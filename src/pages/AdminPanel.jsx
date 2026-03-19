import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  FaUsers, FaDumbbell, FaCalendarAlt, FaStar, FaBars, FaTimes,
  FaEdit, FaTrash, FaCheck, FaEye, FaEyeSlash, FaKey
} from 'react-icons/fa'
import styles from './AdminPanel.module.css'

// Модальное окно для пользователя с возможностью смены пароля
const UserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    fitnessLevel: 'beginner',
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    goal: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  })
  
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'user',
        fitnessLevel: user.fitnessLevel || 'beginner',
        weight: user.weight || '',
        height: user.height || '',
        chest: user.chest || '',
        waist: user.waist || '',
        hips: user.hips || '',
        goal: user.goal || ''
      })
    }
  }, [user])

  const validatePassword = () => {
    const errors = {}
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Введите новый пароль'
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Минимум 8 символов'
    } else if (!/[A-Za-z]/.test(passwordData.newPassword) || !/[0-9]/.test(passwordData.newPassword)) {
      errors.newPassword = 'Должен содержать буквы и цифры'
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают'
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await axios.put(`/api/admin/users/${user.id}`, formData)
      toast.success('Пользователь обновлен')
      onSave(response.data)
      onClose()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.response?.data?.message || 'Ошибка при обновлении')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return
    }
    
    setLoading(true)
    
    try {
      await axios.put(`/api/admin/users/${user.id}/password`, {
        password: passwordData.newPassword
      })
      toast.success('Пароль пользователя изменен')
      setChangingPassword(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.response?.data?.message || 'Ошибка при изменении пароля')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {changingPassword ? 'Смена пароля' : 'Редактирование пользователя'}
          </h3>
          <button onClick={onClose} className={styles.modalCloseButton} disabled={loading}>
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className={styles.modalTabs}>
          <button 
            className={`${styles.modalTab} ${!changingPassword ? styles.activeModalTab : ''}`}
            onClick={() => setChangingPassword(false)}
            disabled={loading}
          >
            Основные данные
          </button>
          <button 
            className={`${styles.modalTab} ${changingPassword ? styles.activeModalTab : ''}`}
            onClick={() => setChangingPassword(true)}
            disabled={loading}
          >Смена пароля
          </button>
        </div>

        {!changingPassword ? (
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Имя</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={styles.formInput}
                  required
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Фамилия</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={styles.formInput}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={styles.formInput}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Роль</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading}
                >
                  <option value="user">Пользователь</option>
                  <option value="trainer">Тренер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Уровень</label>
                <select
                  value={formData.fitnessLevel}
                  onChange={(e) => setFormData({...formData, fitnessLevel: e.target.value})}
                  className={styles.formSelect}
                  disabled={loading}
                >
                  <option value="beginner">Новичок</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>
            </div>

            <h4 className={styles.formSubtitle}>Антропометрические данные</h4>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Вес (кг)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className={styles.formInput}
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Рост (см)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className={styles.formInput}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Грудь (см)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={(e) => setFormData({...formData, chest: e.target.value})}
                  className={styles.formInput}
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Талия (см)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({...formData, waist: e.target.value})}
                  className={styles.formInput}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Бедра (см)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hips}
                  onChange={(e) => setFormData({...formData, hips: e.target.value})}
                  className={styles.formInput}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Цель</label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className={styles.formTextarea}
                rows="3"
                disabled={loading}
              />
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                Отмена
              </button>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.modalForm}>
            <h4 className={styles.formSubtitle}>Смена пароля пользователя</h4>
            <p className={styles.userInfo}>Пользователь: {user?.firstName} {user?.lastName} ({user?.email})</p>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Новый пароль</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className={`${styles.formInput} ${passwordErrors.newPassword ? styles.inputError : ''}`}
                  placeholder="Введите новый пароль"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className={styles.eyeButton}
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <span className={styles.errorMessage}>{passwordErrors.newPassword}</span>
              )}
              <small className={styles.hint}>Минимум 8 символов, буквы и цифры</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Подтверждение пароля</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className={`${styles.formInput} ${passwordErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Подтвердите новый пароль"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className={styles.eyeButton}
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <span className={styles.errorMessage}>{passwordErrors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={() => {
                  setChangingPassword(false)
                  setPasswordData({ newPassword: '', confirmPassword: '' })
                  setPasswordErrors({})
                }} 
                className={styles.cancelButton}
                disabled={loading}
              >
                Отмена
              </button>
              <button 
                type="button" 
                onClick={handleChangePassword}
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Изменить пароль'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

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
    rutubeEndTime: null, // Изменено с '' на null
    instructions: '',
    commonMistakes: ''
  })
  
  const [loading, setLoading] = useState(false)

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
        rutubeEndTime: exercise.rutubeEndTime || null, // Пустую строку преобразуем в null
        instructions: exercise.instructions || '',
        commonMistakes: exercise.commonMistakes || ''
      })
    }
  }, [exercise])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Подготавливаем данные для отправки
      const submitData = {
        ...formData,
        // Преобразуем пустые строки в null для числовых полей
        rutubeStartTime: formData.rutubeStartTime === '' ? 0 : Number(formData.rutubeStartTime),
        rutubeEndTime: formData.rutubeEndTime === '' ? null : Number(formData.rutubeEndTime),
        // Убеждаемся, что все числовые поля преобразованы правильно
        ...(formData.rutubeEndTime === '' && { rutubeEndTime: null })
      }
      
      console.log('Sending exercise data:', submitData)
      
      const response = await axios.put(`/api/exercises/${exercise.id}`, submitData)
      toast.success('Упражнение обновлено')
      onSave(response.data)
      onClose()
    } catch (error) {
      console.error('Update error:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Ошибка при обновлении')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }))
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Редактирование упражнения</h3>
          <button onClick={onClose} className={styles.modalCloseButton} disabled={loading}>
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Название</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.formTextarea}
              rows="3"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Категория</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.formSelect}
                disabled={loading}
              >
                <option value="strength">Силовое</option>
                <option value="cardio">Кардио</option>
                <option value="stretching">Растяжка</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Сложность</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className={styles.formSelect}
                disabled={loading}
              >
                <option value="beginner">Новичок</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Группа мышц</label>
              <input
                type="text"
                name="muscleGroup"
                value={formData.muscleGroup}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Например: Грудь, трицепс"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Инвентарь</label>
              <input
                type="text"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Например: Штанга, гантели"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>URL изображения</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          <h4 className={styles.formSubtitle}>Видео с Rutube</h4>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ссылка на видео</label>
            <input
              type="text"
              name="rutubeFullUrl"
              value={formData.rutubeFullUrl}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="https://rutube.ru/video/..."
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Время начала (сек)</label>
              <input
                type="number"
                name="rutubeStartTime"
                value={formData.rutubeStartTime}
                onChange={handleNumberChange}
                className={styles.formInput}
                min="0"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Время окончания (сек)</label>
              <input
                type="number"
                name="rutubeEndTime"
                value={formData.rutubeEndTime === null ? '' : formData.rutubeEndTime}
                onChange={handleNumberChange}
                className={styles.formInput}
                min="0"
                placeholder="Оставьте пустым до конца"
                disabled={loading}
              />
              <small className={styles.hint}>Оставьте пустым, если видео до конца</small>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Инструкция</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className={styles.formTextarea}
              rows="4"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Частые ошибки</label>
            <textarea
              name="commonMistakes"
              value={formData.commonMistakes}
              onChange={handleChange}
              className={styles.formTextarea}
              rows="3"
              disabled={loading}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              <FaCheck size={14} /> {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const WorkoutModal = ({ isOpen, onClose, workout, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    level: 'beginner',
    category: '',
    imageUrl: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (workout) {
      setFormData({
        name: workout.name || '',
        description: workout.description || '',
        duration: workout.duration || '',
        level: workout.level || 'beginner',
        category: workout.category || '',
        imageUrl: workout.imageUrl || ''
      })
    }
  }, [workout])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    }
    
    if (!formData.duration || formData.duration === '') {
      newErrors.duration = 'Длительность обязательна'
    } else if (isNaN(formData.duration) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Длительность должна быть положительным числом'
    } else if (Number(formData.duration) > 300) {
      newErrors.duration = 'Длительность не может превышать 300 минут'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме')
      return
    }
    
    setLoading(true)
    
    try {
      // Подготавливаем данные для отправки
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration: Number(formData.duration), // Преобразуем в число
        level: formData.level,
        // Опциональные поля
        ...(formData.category && { category: formData.category.trim() }),
        ...(formData.imageUrl && { imageUrl: formData.imageUrl.trim() })
      }
      
      console.log('Sending workout data:', submitData)
      
      const response = await axios.put(`/api/workouts/${workout.id}`, submitData)
      toast.success('Тренировка успешно обновлена')
      onSave(response.data)
      onClose()
    } catch (error) {
      console.error('Update error:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.data?.errors) {
        // Если сервер вернул детальные ошибки
        const serverErrors = {}
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg
        })
        setErrors(serverErrors)
      }
      
      toast.error(error.response?.data?.message || 'Ошибка при обновлении тренировки')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Редактирование тренировки</h3>
          <button onClick={onClose} className={styles.modalCloseButton} disabled={loading}>
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Название *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
              required
              disabled={loading}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${styles.formTextarea} ${errors.description ? styles.inputError : ''}`}
              rows="3"
              required
              disabled={loading}
            />
            {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Длительность (мин) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.duration ? styles.inputError : ''}`}
                required
                min="1"
                max="300"
                step="1"
                disabled={loading}
              />
              {errors.duration && <span className={styles.errorMessage}>{errors.duration}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Уровень</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className={styles.formSelect}
                disabled={loading}
              >
                <option value="beginner">Новичок</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Категория</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Например: Силовая, Кардио"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL изображения</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              <FaCheck size={14} /> {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ReviewModal = ({ isOpen, onClose, review, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    comment: '',
    isApproved: false
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (review) {
      setFormData({
        fullName: review.fullName || '',
        email: review.email || '',
        comment: review.comment || '',
        isApproved: review.isApproved || false
      })
    }
  }, [review])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await axios.put(`/api/reviews/${review.id}`, formData)
      toast.success('Отзыв обновлен')
      onSave(response.data)
      onClose()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.response?.data?.message || 'Ошибка при обновлении')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      await axios.put(`/api/reviews/${review.id}/approve`)
      toast.success('Отзыв опубликован')
      onSave({...review, isApproved: true})
      onClose()
    } catch (error) {
      console.error('Approve error:', error)
      toast.error(error.response?.data?.message || 'Ошибка при публикации')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Редактирование отзыва</h3>
          <button onClick={onClose} className={styles.modalCloseButton} disabled={loading}>
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Имя</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={styles.formInput}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Почта</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={styles.formInput}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Комментарий</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              className={styles.formTextarea}
              rows="4"
              required
              disabled={loading}
            />
          </div>

          {!review?.isApproved && (
            <div className={styles.formGroup}>
              <button 
                type="button" 
                onClick={handleApprove}
                className={styles.approveButton}
                disabled={loading}
              >
                Опубликовать
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// Основной компонент AdminPanel
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [exercises, setExercises] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({})
  
  const [modalState, setModalState] = useState({
    user: { isOpen: false, item: null },
    exercise: { isOpen: false, item: null },
    workout: { isOpen: false, item: null },
    review: { isOpen: false, item: null }
  })
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchStats()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'exercises') fetchExercises()
    if (activeTab === 'workouts') fetchWorkouts()
    if (activeTab === 'reviews') fetchReviews()
  }, [activeTab])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Ошибка загрузки пользователей')
    }
  }

  const fetchExercises = async () => {
    try {
      const response = await axios.get('/api/exercises')
      setExercises(response.data)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      toast.error('Ошибка загрузки упражнений')
    }
  }

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get('/api/workouts')
      setWorkouts(response.data)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast.error('Ошибка загрузки тренировок')
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews/pending')
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Ошибка загрузки отзывов')
    }
  }

  const handleDelete = async (type, id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return
    
    try {
      let url = '';
      switch(type) {
        case 'users':
          url = `/api/admin/users/${id}`;
          break;
        case 'exercises':
          url = `/api/exercises/${id}`;
          break;
        case 'workouts':
          url = `/api/workouts/${id}`;
          break;
        case 'reviews':
          url = `/api/reviews/${id}`;
          break;
      }
      
      await axios.delete(url);
      toast.success('Запись успешно удалена');
      
      if (type === 'users') fetchUsers();
      if (type === 'exercises') fetchExercises();
      if (type === 'workouts') fetchWorkouts();
      if (type === 'reviews') fetchReviews();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Ошибка при удалении');
    }
  }

  const handleSave = (type, updatedItem) => {
    switch(type) {
      case 'users':
        setUsers(users.map(u => u.id === updatedItem.id ? updatedItem : u));
        break;
      case 'exercises':
        setExercises(exercises.map(e => e.id === updatedItem.id ? updatedItem : e));
        break;
      case 'workouts':
        setWorkouts(workouts.map(w => w.id === updatedItem.id ? updatedItem : w));
        break;
      case 'reviews':
        setReviews(reviews.map(r => r.id === updatedItem.id ? updatedItem : r));
        break;
    }
  }

  const openModal = (type, item = null) => {
    setModalState({
      ...modalState,
      [type]: { isOpen: true, item }
    })
  }

  const closeModal = (type) => {
    setModalState({
      ...modalState,
      [type]: { isOpen: false, item: null }
    })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const selectTab = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return styles.badgeAdmin;
      case 'trainer': return styles.badgeTrainer;
      default: return styles.badgeUser;
    }
  }

  const getLevelBadgeClass = (level) => {
    switch(level) {
      case 'beginner': return styles.badgeBeginner;
      case 'intermediate': return styles.badgeIntermediate;
      case 'advanced': return styles.badgeAdvanced;
      default: return styles.badgeBeginner;
    }
  }

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>Панель администратора</h1>
      
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <FaUsers size={24} className={styles.statIcon} />
          <div>
            <h3 className={styles.statTitle}>Пользователи</h3>
            <p className={styles.statValue}>{stats.totalUsers || 0}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaDumbbell size={24} className={styles.statIcon} />
          <div>
            <h3 className={styles.statTitle}>Упражнения</h3>
            <p className={styles.statValue}>{stats.totalExercises || 0}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaCalendarAlt size={24} className={styles.statIcon} />
          <div>
            <h3 className={styles.statTitle}>Тренировки</h3>
            <p className={styles.statValue}>{stats.totalWorkouts || 0}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <FaStar size={24} className={styles.statIcon} />
          <div>
            <h3 className={styles.statTitle}>Отзывы</h3>
            <p className={styles.statValue}>{stats.pendingReviews || 0}</p>
          </div>
        </div>
      </div>
      
      {isMobile && (
        <div className={styles.mobileNav}>
          <button onClick={toggleMobileMenu} className={styles.mobileMenuButton}>
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            <span className={styles.mobileMenuText}>Меню</span>
          </button>
          
          {isMobileMenuOpen && (
            <div className={styles.mobileMenu}>
              <button
                className={`${styles.mobileTab} ${activeTab === 'users' ? styles.activeMobileTab : ''}`}
                onClick={() => selectTab('users')}
              >
                <FaUsers size={16} />
                Пользователи
              </button>
              <button
                className={`${styles.mobileTab} ${activeTab === 'exercises' ? styles.activeMobileTab : ''}`}
                onClick={() => selectTab('exercises')}
              >
                <FaDumbbell size={16} />
                Упражнения
              </button>
              <button
                className={`${styles.mobileTab} ${activeTab === 'workouts' ? styles.activeMobileTab : ''}`}
                onClick={() => selectTab('workouts')}
              >
                <FaCalendarAlt size={16} />
                Тренировки
              </button>
              <button
                className={`${styles.mobileTab} ${activeTab === 'reviews' ? styles.activeMobileTab : ''}`}
                onClick={() => selectTab('reviews')}
              >
                <FaStar size={16} />
                Отзывы
              </button>
            </div>
          )}
        </div>
      )}
      
      {!isMobile && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
            onClick={() => selectTab('users')}
          >
            Пользователи
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'exercises' ? styles.activeTab : ''}`}
            onClick={() => selectTab('exercises')}
          >
            Упражнения
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'workouts' ? styles.activeTab : ''}`}
            onClick={() => selectTab('workouts')}
          >
            Тренировки
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
            onClick={() => selectTab('reviews')}
          >
            Отзывы
          </button>
        </div>
      )}
      
      <div className={styles.content}>
        {activeTab === 'users' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>
               Пользователи
              </h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Уровень</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                          {user.role === 'admin' ? 'Администратор' : 
                           user.role === 'trainer' ? 'Тренер' : 'Пользователь'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${getLevelBadgeClass(user.fitnessLevel)}`}>
                          {user.fitnessLevel === 'beginner' ? 'Новичок' : 
                           user.fitnessLevel === 'intermediate' ? 'Средний' : 'Продвинутый'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => openModal('user', user)}
                            className={styles.editButton}
                            title="Редактировать"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete('users', user.id)}
                            className={styles.deleteButton}
                            title="Удалить"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>
                Упражнения
              </h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Сложность</th>
                    <th>Группа мышц</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map(exercise => (
                    <tr key={exercise.id}>
                      <td>{exercise.id}</td>
                      <td>{exercise.name}</td>
                      <td>
                        {exercise.category === 'strength' ? 'Силовое' : 
                         exercise.category === 'cardio' ? 'Кардио' : 
                         exercise.category === 'stretching' ? 'Растяжка' : 'Другое'}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${getLevelBadgeClass(exercise.difficulty)}`}>
                          {exercise.difficulty === 'beginner' ? 'Новичок' : 
                           exercise.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                        </span>
                      </td>
                      <td>{exercise.muscleGroup || '—'}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => openModal('exercise', exercise)}
                            className={styles.editButton}
                            title="Редактировать"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete('exercises', exercise.id)}
                            className={styles.deleteButton}
                            title="Удалить"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>
                Тренировки
              </h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Длительность</th>
                    <th>Уровень</th>
                    <th>Категория</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map(workout => (
                    <tr key={workout.id}>
                      <td>{workout.id}</td>
                      <td>{workout.name}</td>
                      <td>{workout.duration} мин</td>
                      <td>
                        <span className={`${styles.badge} ${getLevelBadgeClass(workout.level)}`}>
                          {workout.level === 'beginner' ? 'Новичок' : 
                           workout.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                        </span>
                      </td>
                      <td>{workout.category || '—'}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => openModal('workout', workout)}
                            className={styles.editButton}
                            title="Редактировать"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete('workouts', workout.id)}
                            className={styles.deleteButton}
                            title="Удалить"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>
                Отзывы
              </h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ФИО</th>
                    <th>Email</th>
                    <th>Комментарий</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review.id}>
                      <td>{review.id}</td>
                      <td>{review.fullName}</td>
                      <td>{review.email}</td>
                      <td className={styles.commentCell}>{review.comment}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => openModal('review', review)}
                            className={styles.editButton}
                            title="Редактировать"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete('reviews', review.id)}
                            className={styles.deleteButton}
                            title="Удалить"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalState.user.isOpen}
        onClose={() => closeModal('user')}
        user={modalState.user.item}
        onSave={(updated) => handleSave('users', updated)}
      />

      <ExerciseModal
        isOpen={modalState.exercise.isOpen}
        onClose={() => closeModal('exercise')}
        exercise={modalState.exercise.item}
        onSave={(updated) => handleSave('exercises', updated)}
      />

      <WorkoutModal
        isOpen={modalState.workout.isOpen}
        onClose={() => closeModal('workout')}
        workout={modalState.workout.item}
        onSave={(updated) => handleSave('workouts', updated)}
      />

      <ReviewModal
        isOpen={modalState.review.isOpen}
        onClose={() => closeModal('review')}
        review={modalState.review.item}
        onSave={(updated) => handleSave('reviews', updated)}
      />
    </div>
  )
}

export default AdminPanel