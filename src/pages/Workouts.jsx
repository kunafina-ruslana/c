import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaHeart, FaRegHeart, FaClock, FaDumbbell, FaTag, FaPlay } from 'react-icons/fa'
import styles from './Workouts.module.css'

const Workouts = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: ''
  })
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    fetchWorkouts()
  }, [filters])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.level) params.append('level', filters.level)
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      
      const response = await axios.get(`/api/workouts?${params}`)
      setWorkouts(response.data)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast.error('Ошибка загрузки тренировок')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/users/favorites')
      setFavorites(response.data.map(w => w.id))
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const toggleFavorite = async (workoutId, e) => {
    e.stopPropagation()
    
    if (!user) {
      toast.error('Необходимо авторизоваться')
      return
    }

    try {
      if (favorites.includes(workoutId)) {
        await axios.delete(`/api/users/favorites/${workoutId}`)
        setFavorites(favorites.filter(id => id !== workoutId))
        toast.success('Удалено из избранного')
      } else {
        await axios.post(`/api/users/favorites/${workoutId}`)
        setFavorites([...favorites, workoutId])
        toast.success('Добавлено в избранное')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(error.response?.data?.message || 'Ошибка')
    }
  }

  const handleWorkoutClick = (workoutId) => {
    navigate(`/workouts/${workoutId}`)
  }

  const getDifficultyLabel = (level) => {
    switch(level) {
      case 'beginner': return 'Новичок'
      case 'intermediate': return 'Средний'
      case 'advanced': return 'Продвинутый'
      default: return level
    }
  }

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>Тренировки</h1>
      
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Поиск тренировок..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className={styles.searchInput}
        />
        
        <select
          value={filters.level}
          onChange={(e) => setFilters({...filters, level: e.target.value})}
          className={styles.filterSelect}
        >
          <option value="">Все уровни</option>
          <option value="beginner">Новичок</option>
          <option value="intermediate">Средний</option>
          <option value="advanced">Продвинутый</option>
        </select>
        
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className={styles.filterSelect}
        >
          <option value="">Все категории</option>
          <option value="strength">Силовая</option>
          <option value="cardio">Кардио</option>
          <option value="stretching">Растяжка</option>
          <option value="hiit">HIIT</option>
          <option value="yoga">Йога</option>
        </select>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Загрузка тренировок...</div>
      ) : workouts.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Тренировки не найдены</p>
          <p className={styles.emptySubtext}>Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className={styles.workoutsGrid}>
          {workouts.map(workout => (
            <div 
              key={workout.id} 
              className={`${styles.workoutCard} ${hoveredCard === workout.id ? styles.workoutCardHover : ''}`}
              onClick={() => handleWorkoutClick(workout.id)}
              onMouseEnter={() => setHoveredCard(workout.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={styles.cardHeader}>
                {workout.imageUrl ? (
                  <img 
                    src={workout.imageUrl} 
                    alt={workout.name}
                    className={styles.workoutImage}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = 'none'
                      e.target.parentNode.querySelector(`.${styles.imagePlaceholder}`)?.style.setProperty('display', 'flex')
                    }}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <FaDumbbell size={48} />
                  </div>
                )}
                
                <button 
                  onClick={(e) => toggleFavorite(workout.id, e)}
                  className={`${styles.favoriteButton} ${favorites.includes(workout.id) ? styles.favoriteButtonActive : ''}`}
                >
                  {favorites.includes(workout.id) ? (
                    <FaHeart color="#9C271C" size={24} />
                  ) : (
                    <FaRegHeart size={24} />
                  )}
                </button>
                
                <div className={`${styles.levelBadge} ${styles[`level_${workout.level}`]}`}>
                  {getDifficultyLabel(workout.level)}
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.workoutName}>{workout.name}</h3>
                <p className={styles.workoutDescription}>
                  {workout.description?.length > 100 
                    ? workout.description.substring(0, 100) + '...' 
                    : workout.description}
                </p>
                
                <div className={styles.workoutMeta}>
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
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleWorkoutClick(workout.id)
                  }}
                  className={`${styles.startButton} ${hoveredCard === workout.id ? styles.startButtonHover : ''}`}
                > Начать тренировку
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Workouts