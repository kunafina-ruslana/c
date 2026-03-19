import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts'
import { 
  FaEye, FaEyeSlash, FaEdit, FaSave, FaTimes, 
  FaChartLine, FaRuler, FaHeart, FaUser, FaKey,
  FaClock, FaTag, FaTrash,
  FaDumbbell
} from 'react-icons/fa'
import styles from './Profile.module.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [favorites, setFavorites] = useState([])
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState({})
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    profile: false
  })
  
  const [validationErrors, setValidationErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [loading, setLoading] = useState({
    profile: false,
    progress: false,
    measurements: false,
    favorites: false,
    password: false
  })

  useEffect(() => {
    fetchProfileData()
    fetchProgress()
    fetchMeasurements()
    fetchFavorites()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }))
      const response = await axios.get('/api/users/profile')
      setProfileData(response.data)
      setFormData(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Ошибка загрузки профиля')
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  const fetchProgress = async () => {
    try {
      setLoading(prev => ({ ...prev, progress: true }))
      const response = await axios.get('/api/users/progress')
      setProgress(response.data)
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Ошибка загрузки прогресса')
    } finally {
      setLoading(prev => ({ ...prev, progress: false }))
    }
  }

  const fetchMeasurements = async () => {
    try {
      setLoading(prev => ({ ...prev, measurements: true }))
      const response = await axios.get('/api/users/measurements')
      setMeasurements(response.data || [])
    } catch (error) {
      console.error('Error fetching measurements:', error)
      toast.error('Ошибка загрузки замеров')
    } finally {
      setLoading(prev => ({ ...prev, measurements: false }))
    }
  }

  const fetchFavorites = async () => {
    try {
      setLoading(prev => ({ ...prev, favorites: true }))
      const response = await axios.get('/api/users/favorites')
      setFavorites(response.data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Ошибка загрузки избранного')
    } finally {
      setLoading(prev => ({ ...prev, favorites: false }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'Имя обязательно'
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'Минимум 2 символа'
    } else if (!/^[A-Za-zА-Яа-я\s-]+$/.test(formData.firstName)) {
      errors.firstName = 'Только буквы, пробелы и дефисы'
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Фамилия обязательна'
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Минимум 2 символа'
    } else if (!/^[A-Za-zА-Яа-я\s-]+$/.test(formData.lastName)) {
      errors.lastName = 'Только буквы, пробелы и дефисы'
    }
    
    if (formData.weight && formData.weight !== '') {
      const weight = Number(formData.weight)
      if (isNaN(weight)) {
        errors.weight = 'Должно быть числом'
      } else if (weight < 20 || weight > 300) {
        errors.weight = 'От 20 до 300 кг'
      }
    }
    
    if (formData.height && formData.height !== '') {
      const height = Number(formData.height)
      if (isNaN(height)) {
        errors.height = 'Должно быть числом'
      } else if (height < 100 || height > 250) {
        errors.height = 'От 100 до 250 см'
      }
    }
    
    if (formData.chest && formData.chest !== '') {
      const chest = Number(formData.chest)
      if (isNaN(chest)) {
        errors.chest = 'Должно быть числом'
      } else if (chest < 50 || chest > 200) {
        errors.chest = 'От 50 до 200 см'
      }
    }
    
    if (formData.waist && formData.waist !== '') {
      const waist = Number(formData.waist)
      if (isNaN(waist)) {
        errors.waist = 'Должно быть числом'
      } else if (waist < 40 || waist > 200) {
        errors.waist = 'От 40 до 200 см'
      }
    }
    
    if (formData.hips && formData.hips !== '') {
      const hips = Number(formData.hips)
      if (isNaN(hips)) {
        errors.hips = 'Должно быть числом'
      } else if (hips < 50 || hips > 200) {
        errors.hips = 'От 50 до 200 см'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePassword = () => {
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Введите текущий пароль'
    }
    
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setValidationErrors({})
    
    if (!validateForm()) {
      toast.error('Исправьте ошибки в форме')
      return
    }
    
    setLoading(prev => ({ ...prev, profile: true }))
    
    try {
      const updateData = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        gender: formData.gender,
        fitnessLevel: formData.fitnessLevel,
        goal: formData.goal?.trim() || null
      }
      
      if (formData.weight && formData.weight !== '') {
        updateData.weight = parseFloat(formData.weight)
      }
      if (formData.height && formData.height !== '') {
        updateData.height = parseFloat(formData.height)
      }
      if (formData.chest && formData.chest !== '') {
        updateData.chest = parseFloat(formData.chest)
      }
      if (formData.waist && formData.waist !== '') {
        updateData.waist = parseFloat(formData.waist)
      }
      if (formData.hips && formData.hips !== '') {
        updateData.hips = parseFloat(formData.hips)
      }
      
      const response = await axios.put('/api/users/profile', updateData)
      toast.success(response.data.message || 'Профиль обновлен')
      setEditing(false)
      fetchProfileData()
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.data?.errors) {
        const serverErrors = {}
        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            serverErrors[err.path] = err.msg
          })
        } else {
          Object.assign(serverErrors, error.response.data.errors)
        }
        setValidationErrors(serverErrors)
      }
      
      toast.error(error.response?.data?.message || 'Ошибка обновления профиля')
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordErrors({})
    
    if (!validatePassword()) {
      toast.error('Исправьте ошибки в форме')
      return
    }
    
    setLoading(prev => ({ ...prev, password: true }))
    
    try {
      await axios.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Пароль успешно изменен')
      setChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      if (error.response?.status === 401) {
        setPasswordErrors({ currentPassword: 'Неверный текущий пароль' })
      } else {
        toast.error(error.response?.data?.message || 'Ошибка при изменении пароля')
      }
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  const handleAddMeasurement = async () => {
    try {
      await axios.post('/api/users/measurements', {
        weight: profileData?.weight,
        height: profileData?.height,
        chest: profileData?.chest,
        waist: profileData?.waist,
        hips: profileData?.hips
      })
      toast.success('Замеры сохранены')
      fetchMeasurements()
    } catch (error) {
      console.error('Error adding measurement:', error)
      toast.error('Ошибка сохранения замеров')
    }
  }

  const handleRemoveFavorite = async (workoutId, e) => {
    e.stopPropagation()
    
    try {
      await axios.delete(`/api/users/favorites/${workoutId}`)
      setFavorites(favorites.filter(w => w.id !== workoutId))
      toast.success('Тренировка удалена из избранного')
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Ошибка при удалении из избранного')
    }
  }

  const handleWorkoutClick = (workoutId) => {
    navigate(`/workouts/${workoutId}`)
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const chartData = measurements.map(m => ({
    date: new Date(m.date).toLocaleDateString(),
    weight: m.weight,
    chest: m.chest,
    waist: m.waist,
    hips: m.hips
  }))

  const workoutChartData = progress?.workouts?.map(w => ({
    date: new Date(w.date).toLocaleDateString(),
    duration: w.duration,
    calories: w.caloriesBurned
  })) || []

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value})
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev}
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>Личный кабинет</h1>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser size={16} /> Профиль
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'progress' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <FaChartLine size={16} /> Прогресс
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'measurements' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          <FaRuler size={16} /> Замеры
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'favorites' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <FaHeart size={16} /> Избранное
        </button>
      </div>
      
      {activeTab === 'profile' && (
        <div className={styles.tabContent}>
          {loading.profile ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <div className={styles.profileContainer}>
              <div className={styles.profileCard}>
                <h2 className={styles.sectionTitle}> Основная информация
                </h2>
                
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className={styles.form}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Имя</label>
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.firstName ? styles.inputError : ''}`}
                        />
                        {validationErrors.firstName && (
                          <span className={styles.errorMessage}>{validationErrors.firstName}</span>
                        )}
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Фамилия</label>
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.lastName ? styles.inputError : ''}`}
                        />
                        {validationErrors.lastName && (
                          <span className={styles.errorMessage}>{validationErrors.lastName}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        className={styles.formInput}
                        disabled
                      />
                      <small className={styles.hint}>Email нельзя изменить</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Дата рождения</label>
                      <input
                        type="date"
                        value={formData.birthDate || ''}
                        className={styles.formInput}
                        disabled
                      />
                      <small className={styles.hint}>Дату рождения нельзя изменить</small>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Пол</label>
                      <select
                        value={formData.gender || 'unspecified'}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="male">Мужчина</option>
                        <option value="female">Женщина</option>
                        <option value="unspecified">Не указан</option>
                      </select>
                    </div>
                    
                    <h3 className={styles.subsectionTitle}>Физические параметры</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Вес (кг)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="20"
                          max="300"
                          value={formData.weight || ''}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.weight ? styles.inputError : ''}`}
                        />
                        {validationErrors.weight && (
                          <span className={styles.errorMessage}>{validationErrors.weight}</span>
                        )}
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Рост (см)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="100"
                          max="250"
                          value={formData.height || ''}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.height ? styles.inputError : ''}`}
                        />
                        {validationErrors.height && (
                          <span className={styles.errorMessage}>{validationErrors.height}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Грудь (см)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.chest || ''}
                          onChange={(e) => handleInputChange('chest', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.chest ? styles.inputError : ''}`}
                        />
                        {validationErrors.chest && (
                          <span className={styles.errorMessage}>{validationErrors.chest}</span>
                        )}
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Талия (см)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.waist || ''}
                          onChange={(e) => handleInputChange('waist', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.waist ? styles.inputError : ''}`}
                        />
                        {validationErrors.waist && (
                          <span className={styles.errorMessage}>{validationErrors.waist}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Бедра (см)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.hips || ''}
                          onChange={(e) => handleInputChange('hips', e.target.value)}
                          className={`${styles.formInput} ${validationErrors.hips ? styles.inputError : ''}`}
                        />
                        {validationErrors.hips && (
                          <span className={styles.errorMessage}>{validationErrors.hips}</span>
                        )}
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Уровень подготовки</label>
                        <select
                          value={formData.fitnessLevel || 'beginner'}
                          onChange={(e) => handleInputChange('fitnessLevel', e.target.value)}
                          className={styles.formSelect}
                        >
                          <option value="beginner">Новичок</option>
                          <option value="intermediate">Средний</option>
                          <option value="advanced">Продвинутый</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Цель</label>
                      <textarea
                        value={formData.goal || ''}
                        onChange={(e) => handleInputChange('goal', e.target.value)}
                        className={styles.formTextarea}
                        rows="3"
                      />
                    </div>
                    
                    <div className={styles.formActions}>
                      <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={loading.profile}
                      >
                       {loading.profile ? 'Сохранение...' : 'Сохранить изменения'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditing(false)
                          setValidationErrors({})
                          setFormData(profileData)
                        }} 
                        className={styles.cancelButton}
                      > Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.infoContainer}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Имя:</span>
                        <span className={styles.infoValue}>{profileData?.firstName} {profileData?.lastName}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}>{profileData?.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Дата рождения:</span>
                        <span className={styles.infoValue}>
                          {profileData?.birthDate ? new Date(profileData.birthDate).toLocaleDateString() : 'Не указана'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Пол:</span>
                        <span className={styles.infoValue}>
                          {profileData?.gender === 'male' ? 'Мужчина' : 
                           profileData?.gender === 'female' ? 'Женщина' : 'Не указан'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Уровень подготовки:</span>
                        <span className={styles.infoValue}>
                          {profileData?.fitnessLevel === 'beginner' ? 'Новичок' : 
                           profileData?.fitnessLevel === 'intermediate' ? 'Средний' : 'Продвинутый'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className={styles.subsectionTitle}>Физические параметры</h3>
                    
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Вес:</span>
                        <span className={styles.infoValue}>{profileData?.weight ? `${profileData.weight} кг` : 'Не указан'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Рост:</span>
                        <span className={styles.infoValue}>{profileData?.height ? `${profileData.height} см` : 'Не указан'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Грудь:</span>
                        <span className={styles.infoValue}>{profileData?.chest ? `${profileData.chest} см` : 'Не указана'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Талия:</span>
                        <span className={styles.infoValue}>{profileData?.waist ? `${profileData.waist} см` : 'Не указана'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Бедра:</span>
                        <span className={styles.infoValue}>{profileData?.hips ? `${profileData.hips} см` : 'Не указаны'}</span>
                      </div>
                    </div>
                    
                    {profileData?.goal && (
                      <div className={styles.goalSection}>
                        <span className={styles.infoLabel}>Цель:</span>
                        <p className={styles.goalText}>{profileData.goal}</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setEditing(true)} 
                      className={styles.editButton}
                    >Редактировать профиль
                    </button>
                  </div>
                )}
              </div>
              
              <div className={styles.profileCard}>
                <h2 className={styles.sectionTitle}>
                  Безопасность
                </h2>
                
                {!changingPassword ? (
                 
                    <button 
                      onClick={() => setChangingPassword(true)} 
                      className={styles.changePasswordButton}
                    > Изменить пароль
                    </button>
                ) : (
                  <form onSubmit={handleChangePassword} className={styles.passwordForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Текущий пароль</label>
                      <div className={styles.passwordInputWrapper}>
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className={`${styles.formInput} ${passwordErrors.currentPassword ? styles.inputError : ''}`}
                          disabled={loading.password}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className={styles.eyeButton}
                        >
                          {showPassword.current ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <span className={styles.errorMessage}>{passwordErrors.currentPassword}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Новый пароль</label>
                      <div className={styles.passwordInputWrapper}>
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className={`${styles.formInput} ${passwordErrors.newPassword ? styles.inputError : ''}`}
                          disabled={loading.password}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className={styles.eyeButton}
                        >
                          {showPassword.new ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <span className={styles.errorMessage}>{passwordErrors.newPassword}</span>
                      )}
                      <small className={styles.hint}>Минимум 8 символов, буквы и цифры</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Подтверждение пароля</label>
                      <div className={styles.passwordInputWrapper}>
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className={`${styles.formInput} ${passwordErrors.confirmPassword ? styles.inputError : ''}`}
                          disabled={loading.password}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className={styles.eyeButton}
                        >
                          {showPassword.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <span className={styles.errorMessage}>{passwordErrors.confirmPassword}</span>
                      )}
                    </div>

                    <div className={styles.formActions}>
                      <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={loading.password}
                      >
                        {loading.password ? 'Сохранение...' : 'Сохранить пароль'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setChangingPassword(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })
                          setPasswordErrors({})
                        }} 
                        className={styles.cancelButton}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'progress' && (
        <div className={styles.tabContent}>
          {loading.progress ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Всего тренировок</h3>
                  <p className={styles.statValue}>{progress?.totalWorkouts || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Сожжено калорий</h3>
                  <p className={styles.statValue}>{progress?.totalCalories || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>Времени (мин)</h3>
                  <p className={styles.statValue}>{progress?.totalMinutes || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3 className={styles.statTitle}>ИМТ</h3>
                  <p className={styles.statValue}>{progress?.bmi || '—'}</p>
                </div>
              </div>
              
              {workoutChartData.length > 0 && (
                <div className={styles.chartContainer}>
                  <h3 className={styles.chartTitle}>График тренировок</h3>
                  <div className={styles.chartWrapper}>
                    <LineChart width={600} height={300} data={workoutChartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="duration" stroke="var(--accent-color)" />
                    </LineChart>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {activeTab === 'measurements' && (
        <div className={styles.tabContent}>
          {loading.measurements ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <>
              <button onClick={handleAddMeasurement} className={styles.addButton}>
                Сохранить текущие замеры
              </button>
              
              {chartData.length > 0 && (
                <div className={styles.chartContainer}>
                  <h3 className={styles.chartTitle}>Динамика замеров</h3>
                  <div className={styles.chartWrapper}>
                    <LineChart width={600} height={300} data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                      <Line type="monotone" dataKey="chest" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="waist" stroke="#ffc658" />
                      <Line type="monotone" dataKey="hips" stroke="#ff7300" />
                    </LineChart>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {activeTab === 'favorites' && (
        <div className={styles.tabContent}>
          {loading.favorites ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : favorites.length === 0 ? (
            <div className={styles.emptyState}>
              <FaHeart size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>У вас пока нет избранных тренировок</p>
              <p className={styles.emptySubtext}>Отмечайте тренировки сердечком в каталоге, чтобы они появились здесь</p>
              <button 
                onClick={() => navigate('/workouts')} 
                className={styles.browseButton}
              >
                Перейти к тренировкам
              </button>
            </div>
          ) : (
            <div className={styles.favoritesGrid}>
              {favorites.map(workout => (
                <div 
                  key={workout.id} 
                  className={styles.favoriteCard}
                  onClick={() => handleWorkoutClick(workout.id)}
                >
                  <div className={styles.favoriteImageContainer}>
                    <img 
                      src={workout.imageUrl || 'https://via.placeholder.com/300x200?text=' + workout.name} 
                      alt={workout.name}
                      className={styles.favoriteImage}
                    />
                    <button 
                      onClick={(e) => handleRemoveFavorite(workout.id, e)}
                      className={styles.removeFavoriteButton}
                      title="Удалить из избранного"
                    >
                      <FaTrash size={16} />
                    </button>
                    <div className={`${styles.levelBadge} ${styles[workout.level]}`}>
                      {workout.level === 'beginner' ? 'Новичок' : 
                       workout.level === 'intermediate' ? 'Средний' : 'Продвинутый'}
                    </div>
                  </div>
                  <div className={styles.favoriteContent}>
                    <h3 className={styles.favoriteTitle}>{workout.name}</h3>
                    <p className={styles.favoriteDescription}>
                      {workout.description?.length > 100 
                        ? workout.description.substring(0, 100) + '...' 
                        : workout.description}
                    </p>
                    <div className={styles.favoriteMeta}>
                      <span className={styles.metaItem}>
                        <FaClock size={12} /> {workout.duration} мин
                      </span>
                      <span className={styles.metaItem}>
                        <FaDumbbell size={12} /> {workout.exercises?.length || 0} упр
                      </span>
                      {workout.category && (
                        <span className={styles.metaItem}>
                          <FaTag size={12} /> {workout.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile