import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  FaUsers, FaDumbbell, FaCalendarAlt, FaStar, FaBars, FaTimes,
  FaEdit, FaTrash, FaCheck, FaEye, FaEyeSlash, FaKey, FaPlus
} from 'react-icons/fa'
import styles from './AdminPanel.module.css'
import WorkoutModal from '../components/modals/WorkoutModal'
import ExerciseModal from '../components/modals/ExerciseModal'

// Модальное окно для пользователя с возможностью создания и редактирования
const UserModal = ({ isOpen, onClose, user, onSave, isCreating = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    fitnessLevel: 'beginner',
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    goal: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user && !isCreating) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        fitnessLevel: user.fitnessLevel || 'beginner',
        weight: user.weight || '',
        height: user.height || '',
        chest: user.chest || '',
        waist: user.waist || '',
        hips: user.hips || '',
        goal: user.goal || ''
      })
    } else if (isCreating) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        fitnessLevel: 'beginner',
        weight: '',
        height: '',
        chest: '',
        waist: '',
        hips: '',
        goal: ''
      })
    }
    setErrors({})
  }, [user, isCreating, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }
    
    if (isCreating && !formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов'
    } else if (formData.password && (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password))) {
      newErrors.password = 'Должен содержать буквы и цифры'
    }
    
    if (formData.weight && (formData.weight < 20 || formData.weight > 300)) {
      newErrors.weight = 'Вес должен быть от 20 до 300 кг'
    }
    
    if (formData.height && (formData.height < 100 || formData.height > 250)) {
      newErrors.height = 'Рост должен быть от 100 до 250 см'
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
      let response;
      const submitData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        chest: formData.chest ? parseFloat(formData.chest) : null,
        waist: formData.waist ? parseFloat(formData.waist) : null,
        hips: formData.hips ? parseFloat(formData.hips) : null
      };
      
      if (isCreating) {
        response = await axios.post('/api/admin/users', submitData);
        toast.success('Пользователь успешно создан');
      } else {
        response = await axios.put(`/api/admin/users/${user.id}`, submitData);
        toast.success('Пользователь обновлен');
      }
      
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
          <h3 className={styles.modalTitle}>
            {isCreating ? 'Создание пользователя' : 'Редактирование пользователя'}
          </h3>
          <button onClick={onClose} className={styles.modalCloseButton} disabled={loading}>
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Имя *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.firstName ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.firstName && <span className={styles.errorMessage}>{errors.firstName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Фамилия *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.lastName ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.lastName && <span className={styles.errorMessage}>{errors.lastName}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
              disabled={loading}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          {isCreating && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Пароль *</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Введите пароль"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={styles.eyeButton}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
              <small className={styles.hint}>Минимум 8 символов, буквы и цифры</small>
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Роль</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
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
                name="fitnessLevel"
                value={formData.fitnessLevel}
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

          <h4 className={styles.formSubtitle}>Антропометрические данные</h4>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Вес (кг)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.weight ? styles.inputError : ''}`}
                step="0.1"
                min="20"
                max="300"
                disabled={loading}
              />
              {errors.weight && <span className={styles.errorMessage}>{errors.weight}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Рост (см)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.height ? styles.inputError : ''}`}
                step="0.1"
                min="100"
                max="250"
                disabled={loading}
              />
              {errors.height && <span className={styles.errorMessage}>{errors.height}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Грудь (см)</label>
              <input
                type="number"
                name="chest"
                value={formData.chest}
                onChange={handleChange}
                className={styles.formInput}
                step="0.1"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Талия (см)</label>
              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                className={styles.formInput}
                step="0.1"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Бедра (см)</label>
              <input
                type="number"
                name="hips"
                value={formData.hips}
                onChange={handleChange}
                className={styles.formInput}
                step="0.1"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Цель</label>
            <textarea
              name="goal"
              value={formData.goal}
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
            <button type="submit" className={styles.approveButton} disabled={loading}>
              <FaCheck size={14} /> {loading ? 'Сохранение...' : (isCreating ? 'Создать' : 'Сохранить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Модальное окно для отзыва (только редактирование, без создания)
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

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [exercises, setExercises] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({})
  
  const [modalState, setModalState] = useState({
    user: { isOpen: false, item: null, isCreating: false },
    exercise: { isOpen: false, item: null, isCreating: false },
    workout: { isOpen: false, item: null, isCreating: false },
    review: { isOpen: false, item: null, isCreating: false }
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
        if (modalState.user.isCreating) {
          setUsers([updatedItem, ...users]);
        } else {
          setUsers(users.map(u => u.id === updatedItem.id ? updatedItem : u));
        }
        break;
      case 'exercises':
        if (modalState.exercise.isCreating) {
          setExercises([updatedItem, ...exercises]);
        } else {
          setExercises(exercises.map(e => e.id === updatedItem.id ? updatedItem : e));
        }
        break;
      case 'workouts':
        if (modalState.workout.isCreating) {
          setWorkouts([updatedItem, ...workouts]);
        } else {
          setWorkouts(workouts.map(w => w.id === updatedItem.id ? updatedItem : w));
        }
        break;
      case 'reviews':
        setReviews(reviews.map(r => r.id === updatedItem.id ? updatedItem : r));
        break;
    }
  }

  const openModal = (type, item = null, isCreating = false) => {
    setModalState({
      ...modalState,
      [type]: { isOpen: true, item, isCreating }
    })
  }

  const closeModal = (type) => {
    setModalState({
      ...modalState,
      [type]: { isOpen: false, item: null, isCreating: false }
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
      <div className={styles.header}>
        <h1 className={styles.title}>Панель администратора</h1>
      </div>
      
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
      
      <div className={styles.headerButtons}>
        {activeTab === 'users' && (
          <button 
            onClick={() => openModal('user', null, true)} 
            className={styles.createButton}
          >
            <FaPlus size={14} /> Создать пользователя
          </button>
        )}
        {activeTab === 'exercises' && (
          <button 
            onClick={() => openModal('exercise', null, true)} 
            className={styles.createButton}
          >
            <FaPlus size={14} /> Создать упражнение
          </button>
        )}
        {activeTab === 'workouts' && (
          <button 
            onClick={() => openModal('workout', null, true)} 
            className={styles.createButton}
          >
            <FaPlus size={14} /> Создать тренировку
          </button>
        )}
      </div>
      
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
                            onClick={() => openModal('user', user, false)}
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
                            onClick={() => openModal('exercise', exercise, false)}
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
                            onClick={() => openModal('workout', workout, false)}
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
                            onClick={() => openModal('review', review, false)}
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
        isCreating={modalState.user.isCreating}
      />

      <ExerciseModal
        isOpen={modalState.exercise.isOpen}
        onClose={() => closeModal('exercise')}
        exercise={modalState.exercise.item}
        onSave={(updated) => handleSave('exercises', updated)}
        isCreating={modalState.exercise.isCreating}
      />

      <WorkoutModal
        isOpen={modalState.workout.isOpen}
        onClose={() => closeModal('workout')}
        workout={modalState.workout.item}
        onSave={(updated) => handleSave('workouts', updated)}
        isCreating={modalState.workout.isCreating}
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