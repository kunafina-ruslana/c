import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaArrowLeft, FaArrowRight, FaFile, FaPhoneAlt } from 'react-icons/fa'
import styles from './Home.module.css'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    comment: ''
  })
  const [errors, setErrors] = useState({})
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef(null)

  useEffect(() => {
    if (reviews.length > 0 && isAutoPlaying) {
      startAutoPlay()
    }
    return () => stopAutoPlay()
  }, [reviews.length, currentIndex, isAutoPlaying])

  const startAutoPlay = () => {
    stopAutoPlay()
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => {

        if (prev >= reviews.length - 3) {
          return 0
        }
        return prev + 1
      })
    }, 3000)
  }

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }

  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
    stopAutoPlay()
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }


  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews')
      console.log('Reviews response:', response.data)
      
            const reviewsData = Array.isArray(response.data) ? response.data : []
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([]) 
    }
  }
  const nextSlide = () => {
    stopAutoPlay()
    if (currentIndex < reviews.length - 3) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
    if (isAutoPlaying) {
      startAutoPlay()
    }
  }

  const prevSlide = () => {
    stopAutoPlay()
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      setCurrentIndex(reviews.length - 3)
    }
    if (isAutoPlaying) {
      startAutoPlay()
    }
  }

  const goToSlide = (index) => {
    stopAutoPlay()
    setCurrentIndex(index)
    if (isAutoPlaying) {
      startAutoPlay()
    }
  }

  const handleStartWorkout = () => {
    if (!isAuthenticated) {
      const confirm = window.confirm('Прогресс не будет сохранен. Хотите авторизоваться или продолжить?')
      if (confirm) {
        navigate('/workouts')
      } else {
        navigate('/login')
      }
    } else {
      navigate('/workouts')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО'
    } else if (!/^[A-Za-zА-Яа-я\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Только буквы'
    }

    if (!formData.email) {
      newErrors.email = 'Введите email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Введите комментарий'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await axios.post('/api/reviews', formData)
      toast.success('Отправлено на модерацию')
      setFormData({ fullName: '', email: '', comment: '' })
      fetchReviews()
    } catch (error) {
      toast.error('Ошибка отправки')
    }
  }

  const advantages = [
    {
      title: 'Персональные тренировки',
      description: 'Индивидуальные программы, адаптированные под ваш уровень и цели'
    },
    {
      title: 'Трекинг прогресса',
      description: 'Детальная статистика ваших достижений и динамика результатов'
    },
    {
      title: 'Видеоинструкции',
      description: 'Более 1000 упражнений с подробными видеоуроками'
    },
    {
      title: 'Доступ 24/7',
      description: 'Занимайтесь где угодно и когда угодно с мобильного устройства'
    }
  ]

  return (
    <div>
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Ваш личный дневник движений к идеальной форме</h1>
          <p className={styles.heroText}>
            Тысячи упражнений с видеоинструкциями, умный дневник тренировок и трекинг прогресса — всё в одном приложении. Начни заниматься осознанно уже сегодня.
          </p>
          <button onClick={handleStartWorkout} className={styles.heroBtn}>
            Начать тренировку
          </button>
        </div>
      </section>

      <section className={`container ${styles.advantages}`}>
        <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
        <div className={styles.advantagesGrid}>
          {advantages.map((item, index) => (
   <div key={index} className={styles.advantageCard}>
              <h3 className={styles.advantageTitle}>{item.title}</h3>
              <p className={styles.advantageDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.reviews}>
        <h2 className={styles.title}>Отзывы наших клиентов</h2>

        {reviews.length > 0 && (
          <div
            className={styles.carouselContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={styles.arrowLeft}
              onClick={prevSlide}
            >
              <FaArrowLeft />
            </button>

            <div className={styles.viewport}>
              <div
                className={styles.track}
                style={{
                  transform: `translateX(-${currentIndex * 320}px)`,
                  transition: 'transform 0.5s ease'
                }}
              >
                {reviews.map((review) => (
                  <div key={review.id} className={styles.card}>
                    <p className={styles.comment}>
                      "{review.comment}"
                    </p>
                    <div className={styles.comment_data}>
                      <p>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</p> <p className={styles.author}>
                      {review.fullName}
                    </p>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>

            <button
              className={styles.arrowRight}
              onClick={nextSlide}
            >
              <FaArrowRight />
            </button>

            {reviews.length > 2 && (
              <div className={styles.dots}>
                {Array.from({ length: reviews.length - 2 }).map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className={styles.feedback}>
        <div className={`container ${styles.feedbackContainer}`}>
          <div className={styles.feedbackInfo}>
            <h2 className={styles.feedbackTitle}>Мы с вами на связи</h2>
            <p className={styles.feedbackText}>
              Есть вопросы, идеи или нужна помощь? Мы всегда на связи и готовы сделать «Дневник Движения» лучше вместе с вами.
            </p>
            <div className={styles.feedbackContacts}>
              <p className={styles.feedbackPhone}>
                <FaPhoneAlt size={18} /> +7 (958) 838-63-76
              </p>
              <p className={styles.feedbackEmail}>
                <FaFile size={18} /> sport@movementdiary.ru
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className={styles.feedbackForm}>
            <h2 className={styles.feedbackFormTitle}>Оставить отзыв</h2>

            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="ФИО"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`${styles.formInput} ${errors.fullName ? styles.formInputError : ''}`}
              />
              {errors.fullName && <span className={styles.formError}>{errors.fullName}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
              />
              {errors.email && <span className={styles.formError}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <textarea
                placeholder="Комментарий"
                rows="5"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className={`${styles.formTextarea} ${errors.comment ? styles.formInputError : ''}`}
              />
              {errors.comment && <span className={styles.formError}>{errors.comment}</span>}
            </div>

            <button type="submit" className={styles.feedbackBtn}>
              Отправить
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Home