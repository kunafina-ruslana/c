import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Register.module.css'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: 'unspecified',
    agreement: false
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя'
    } else if (!/^[A-Za-zА-Яа-я]+$/.test(formData.firstName)) {
      newErrors.firstName = 'Только буквы'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Минимум 2 символа'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию'
    } else if (!/^[A-Za-zА-Яа-я]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Только буквы'
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Минимум 2 символа'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов'
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Должен содержать буквы и цифры'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Введите дату рождения'
    } else {
      const birthYear = new Date(formData.birthDate).getFullYear()
      const currentYear = new Date().getFullYear()
      const age = currentYear - birthYear
      
      if (age < 8) {
        newErrors.birthDate = 'Возраст должен быть не менее 8 лет'
      } else if (age > 100) {
        newErrors.birthDate = 'Возраст должен быть не более 100 лет'
      }
    }
    
    if (!formData.agreement) {
      newErrors.agreement = 'Необходимо согласие на обработку данных'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    
    if (!validateForm()) return
    
    try {
      const success = await register(formData)
      if (success) {
        navigate('/profile')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при регистрации'
      setServerError(errorMessage)
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    }
  }

  return (
    <div className={`${styles.container}`}>
      <div className={styles.form_container}>
        <h1 className={styles.title}>Регистрация</h1>
        
        {serverError && (
          <div className={styles.server_error}>
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.form_group}>
            <input
              type="text"
              placeholder="Имя"
              value={formData.firstName}
              onChange={(e) => {
                setFormData({...formData, firstName: e.target.value})
                if (errors.firstName) setErrors({...errors, firstName: ''})
              }}
              className={`${styles.input} ${errors.firstName ? styles.input_error : ''}`}
            />
            {errors.firstName && <span className={styles.field_error}>{errors.firstName}</span>}
          </div>
          
          <div className={styles.form_group}>
            <input
              type="text"
              placeholder="Фамилия"
              value={formData.lastName}
              onChange={(e) => {
                setFormData({...formData, lastName: e.target.value})
                if (errors.lastName) setErrors({...errors, lastName: ''})
              }}
              className={`${styles.input} ${errors.lastName ? styles.input_error : ''}`}
            />
            {errors.lastName && <span className={styles.field_error}>{errors.lastName}</span>}
          </div>
          
          <div className={styles.form_group}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value})
                if (errors.email) setErrors({...errors, email: ''})
              }}
              className={`${styles.input} ${errors.email ? styles.input_error : ''}`}
            />
            {errors.email && <span className={styles.field_error}>{errors.email}</span>}
          </div>
          
          <div className={styles.form_group}>
            <input
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={(e) => {
                setFormData({...formData, password: e.target.value})
                if (errors.password) setErrors({...errors, password: ''})
              }}
              className={`${styles.input} ${errors.password ? styles.input_error : ''}`}
            />
            {errors.password && <span className={styles.field_error}>{errors.password}</span>}
            <small className={styles.hint}>Минимум 8 символов, буквы и цифры</small>
          </div>
          
          <div className={styles.form_group}>
            <input
              type="password"
              placeholder="Подтверждение пароля"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({...formData, confirmPassword: e.target.value})
                if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''})
              }}
              className={`${styles.input} ${errors.confirmPassword ? styles.input_error : ''}`}
            />
            {errors.confirmPassword && <span className={styles.field_error}>{errors.confirmPassword}</span>}
          </div>
          
          <div className={styles.form_group}>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => {
                setFormData({...formData, birthDate: e.target.value})
                if (errors.birthDate) setErrors({...errors, birthDate: ''})
              }}
              className={`${styles.input} ${errors.birthDate ? styles.input_error : ''}`}
            />
            {errors.birthDate && <span className={styles.field_error}>{errors.birthDate}</span>}
          </div>
          
          <div className={styles.form_group}>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className={styles.select}
            >
              <option value="unspecified">Не указан</option>
              <option value="male">Мужчина</option>
              <option value="female">Женщина</option>
            </select>
          </div>
          
          <div className={styles.form_group}>
            <label className={styles.checkbox_label}>
              <input
                type="checkbox"
                checked={formData.agreement}
                onChange={(e) => {
                  setFormData({...formData, agreement: e.target.checked})
                  if (errors.agreement) setErrors({...errors, agreement: ''})
                }}
                className={styles.checkbox}
              />
              Согласие на обработку персональных данных
            </label>
            {errors.agreement && <span className={styles.field_error}>{errors.agreement}</span>}
          </div>
          
          <button type="submit" className={`btn ${styles.button}`}>
            Зарегистрироваться
          </button>
        </form>
        
        <p className={styles.link}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}

export default Register