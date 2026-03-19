import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL
  }, [])

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/users/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email)
      
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      })
      
      console.log('Login response:', response.data)
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return true
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.response) {
        // Сервер вернул ошибку
        console.log('Error status:', error.response.status)
        console.log('Error data:', error.response.data)
        
        if (error.response.status === 401) {
          toast.error('Неверный email или пароль')
        } else {
          toast.error(error.response.data?.message || 'Ошибка входа')
        }
      } else if (error.request) {
        // Запрос был отправлен, но нет ответа
        console.log('No response received')
        toast.error('Сервер не отвечает. Проверьте подключение.')
      } else {
        // Ошибка при настройке запроса
        console.log('Request setup error:', error.message)
        toast.error('Ошибка при отправке запроса')
      }
      
      return false
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return true
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Ошибка регистрации')
      } else {
        toast.error('Ошибка при регистрации')
      }
      
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isTrainer: user?.role === 'trainer'
    }}>
      {children}
    </AuthContext.Provider>
  )
}