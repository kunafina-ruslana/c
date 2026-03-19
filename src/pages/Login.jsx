import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    
    if (!validateForm()) return
    
    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        navigate('/')
      } else {
        setServerError('Неверный email или пароль')
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Ошибка при входе. Проверьте email и пароль')
    }
  }

  return (
    <div className={`${styles.container}`}>
      <div className={styles.form_container}>
        <h1 className={styles.title}>Вход</h1>
        
        {serverError && (
          <div className={styles.server_error}>
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
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
          </div>
          
          <button type="submit" className={`btn ${styles.button}`}>
            Войти
          </button>
        </form>
        
        <p className={styles.link}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}

export default Login