import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  FaClock, FaDumbbell, FaTag, FaHeart, FaRegHeart,
  FaPlay, FaArrowLeft, FaList, FaCheck, FaPause,
  FaCheckCircle
} from 'react-icons/fa'
import RutubePlayer from '../components/RutubePlayer'
import styles from './WorkoutDetail.module.css'

const WorkoutDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restTime, setRestTime] = useState(30)
  const [timer, setTimer] = useState(null)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [completedExercises, setCompletedExercises] = useState([])

  useEffect(() => {
    fetchWorkout()
  }, [id])

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timer])

  const fetchWorkout = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/workouts/${id}`)
      setWorkout(response.data)

      if (user) {
        checkIfFavorite()
      }
    } catch (error) {
      console.error('Error fetching workout:', error)
      toast.error('Ошибка загрузки тренировки')
      navigate('/workouts')
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorite = async () => {
    try {
      const response = await axios.get('/api/users/favorites')
      const favorites = response.data.map(w => w.id)
      setIsFavorite(favorites.includes(parseInt(id)))
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Необходимо авторизоваться')
      return
    }

    try {
      if (isFavorite) {
        await axios.delete(`/api/users/favorites/${id}`)
        setIsFavorite(false)
        toast.success('Удалено из избранного')
      } else {
        await axios.post(`/api/users/favorites/${id}`)
        setIsFavorite(true)
        toast.success('Добавлено в избранное')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Ошибка')
    }
  }

  const startWorkout = () => {
    setWorkoutStarted(true)
    setCurrentExercise(0)
    setIsResting(false)
    setCompletedExercises([])
  }

  const startRest = () => {
    setIsResting(true)
    setRestTime(30)
    if (timer) clearInterval(timer)

    const interval = setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          nextExercise()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setTimer(interval)
  }

  const nextExercise = () => {
    if (timer) clearInterval(timer)

    if (!completedExercises.includes(currentExercise)) {
      setCompletedExercises([...completedExercises, currentExercise])
    }

    if (workout.exercises && currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setIsResting(false)
    } else {
      completeWorkout()
    }
  }

  const completeWorkout = () => {
    setWorkoutStarted(false)
    if (user) {
      axios.put(`/api/workouts/${id}/complete`, {
        duration: workout.duration,
        caloriesBurned: Math.round(workout.duration * 5)
      }).catch(err => console.error('Error saving progress:', err))
    }
    toast.success('Тренировка завершена!')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getLevelLabel = (level) => {
    switch (level) {
      case 'beginner': return 'Новичок'
      case 'intermediate': return 'Средний'
      case 'advanced': return 'Продвинутый'
      default: return level
    }
  }

  if (loading) {
    return <div className={`container ${styles.loading}`}>Загрузка...</div>
  }

  if (!workout) {
    return <div className={`container ${styles.error}`}>Тренировка не найдена</div>
  }

  if (workoutStarted) {
    const exercises = workout.exercises || []
    const currentEx = exercises[currentExercise]
    const progress = ((currentExercise + 1) / exercises.length) * 100

    return (
      <div className={`container ${styles.playerContainer}`}>
        <div className={styles.playerHeader}>
          <button onClick={() => setWorkoutStarted(false)} className={styles.backButton}>
            <FaArrowLeft /> Выйти
          </button>
          <div className={styles.playerProgress}>
            {currentExercise + 1} / {exercises.length}
          </div>
        </div>

        {isResting ? (
          <div className={styles.restScreen}>
            <h3 className={styles.restTitle}>Отдых</h3>
            <div className={styles.restTimer}>{restTime} сек</div>
            <p className={styles.restNext}>
              Следующее: {exercises[currentExercise + 1]?.name}
            </p>
            <button onClick={nextExercise} className={styles.skipButton}>
              Пропустить
            </button>
          </div>
        ) : (
          <div className={styles.exerciseScreen}>
            <div className={styles.exerciseHeader}>
              <h3 className={styles.exerciseName}>{currentEx?.name}</h3>
              {currentEx?.WorkoutExercise && (
                <div className={styles.exerciseStats}>
                  <span className={styles.exerciseSet}>
                    {currentEx.WorkoutExercise.sets} x {currentEx.WorkoutExercise.reps}
                  </span>
                </div>
              )}
            </div>

            {currentEx?.rutubeVideoId ? (
              <div className={styles.videoWrapper}>
                <RutubePlayer
                  videoId={currentEx.rutubeVideoId}
                  startTime={currentEx.rutubeStartTime || 0}
                  endTime={currentEx.rutubeEndTime}
                />
              </div>
            ) : (
              <div className={styles.videoPlaceholder}>
                <p>Видео не доступно</p>
                <p className={styles.videoPlaceholderHint}>Следуйте инструкции</p>
              </div>
            )}

            <div className={styles.exerciseInfo}>
              {currentEx?.description && (
                <div className={styles.exerciseDescription}>
                  <h4>Описание</h4>
                  <p>{currentEx.description}</p>
                </div>
              )}

              {currentEx?.instructions && (
                <details className={styles.exerciseInstructions}>
                  <summary>Инструкция выполнения</summary>
                  <div className={styles.instructionsContent}>
                    <p>{currentEx.instructions}</p>
                  </div>
                </details>
              )}
            </div>

            <div className={styles.exerciseControls}>
              {currentExercise < exercises.length - 1 ? (
                 <button onClick={startRest} className={styles.primaryButton}>
                Завершить подход
              </button>
              ) : (
                <button onClick={completeWorkout} className={styles.successButton}>
                  Завершить
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <button onClick={() => navigate('/workouts')} className={styles.backButton}>
          <FaArrowLeft /> К списку
        </button>
        <button onClick={toggleFavorite} className={styles.favoriteButton}>
          {isFavorite ? <FaHeart color="#9C271C" size={24} /> : <FaRegHeart size={24} />}
        </button>
      </div>

      <div className={styles.workoutImage}>
        <img
          src={workout.imageUrl || 'https://via.placeholder.com/800x400?text=Тренировка'}
          alt={workout.name}
        />
        <div className={styles.imageOverlay}>
          <span className={styles.imageBadge}>
            <h1>{workout.name}</h1>
          </span>
        </div>
      </div>

      <button onClick={startWorkout} className={styles.startButton}>Начать тренировку</button>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <FaClock className={styles.metaIcon} />
          <span>{workout.duration} мин</span>
        </div>
        <div className={styles.metaItem}>
          <FaDumbbell className={styles.metaIcon} />
          <span>{workout.exercises?.length || 0} упражнений</span>
        </div>
        {workout.category && (
          <div className={styles.metaItem}>
            <FaTag className={styles.metaIcon} />
            <span>{workout.category}</span>
          </div>
        )}
        <div className={`${styles.metaItem} ${styles.levelBadge} ${styles[`level_${workout.level}`]}`}>
          <FaCheckCircle className={styles.metaIcon} /> {getLevelLabel(workout.level)}
        </div>
      </div>

      {workout.description && (
        <div className={styles.description}>
          <h3>Описание тренировки</h3>
          <p>{workout.description}</p>
        </div>
      )}

      <div className={styles.exercisesList}>
        <h3>Упражнения</h3>
        <div className={styles.exercisesGrid}>
          {workout.exercises?.map((ex, idx) => (
            <div key={ex.id} className={styles.exerciseCard}>
              <div className={styles.exerciseCardHeader}>
                <span className={styles.exerciseNumber}>{idx + 1}</span>
                <h4 className={styles.exerciseCardTitle}>{ex.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkoutDetail