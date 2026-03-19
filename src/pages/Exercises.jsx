import { useState, useEffect } from 'react'
import axios from 'axios'
import RutubePlayer from '../components/RutubePlayer'
import { FaChevronDown, FaChevronUp, FaPlay, FaDumbbell, FaStar, FaFire } from 'react-icons/fa'
import styles from './Exercises.module.css'

const Exercises = () => {
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    instructions: false,
    mistakes: false
  })
  const [filters, setFilters] = useState({
    muscleGroup: '',
    difficulty: '',
    category: '',
    equipment: ''
  })

  useEffect(() => {
    fetchExercises()
  }, [filters])

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`/api/exercises?${params}`)
      setExercises(response.data)
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
  
  const getDifficultyLabel = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 'Новичок'
      case 'intermediate': return 'Средний'
      case 'advanced': return 'Продвинутый'
      default: return difficulty
    }
  }

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>Упражнения</h1>
      
      <div className={styles.filters}>
              
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
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
          <option value="">Все типы</option>
          <option value="strength">Силовые</option>
          <option value="cardio">Кардио</option>
          <option value="stretching">Растяжка</option>
          <option value="other">Другое</option>
        </select>
        
        <select
          value={filters.equipment}
          onChange={(e) => setFilters({...filters, equipment: e.target.value})}
          className={styles.filterSelect}
        >
          <option value="">Без инвентаря</option>
          <option value="dumbbells">Гантели</option>
          <option value="barbell">Штанга</option>
          <option value="kettlebell">Гиря</option>
          <option value="band">Резинка</option>
        </select>
      </div>
      
      <div className={styles.exercisesGrid}>
        {exercises.map(exercise => (
          <div 
            key={exercise.id} 
            className={`${styles.exerciseCard} ${hoveredCard === exercise.id ? styles.exerciseCardHover : ''}`}
            onClick={() => {
              setSelectedExercise(exercise)
              setExpandedSections({
                description: false,
                instructions: false,
                mistakes: false
              })
            }}
            onMouseEnter={() => setHoveredCard(exercise.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={styles.cardImageWrapper}>
              <img 
                src={exercise.imageUrl || 'https://via.placeholder.com/300x200?text=Упражнение'} 
                alt={exercise.name}
                className={styles.exerciseImage}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://via.placeholder.com/300x200?text=Упражнение'
                }}
              />
              
              <div className={styles.difficultyBadge} >
                {getDifficultyLabel(exercise.difficulty)}
              </div>
            </div>
            
            <div className={styles.exerciseInfo}>
              <h3 className={styles.exerciseName}>{exercise.name}</h3>
              
              {exercise.equipment && exercise.equipment !== 'none' && (
                <div className={styles.equipmentBadge}>
                  Инвентарь - {exercise.equipment}
                </div>
              )}
              
              <div className={styles.exerciseMeta}>
               
                
                {exercise.category && (
                  <span className={styles.metaItem}>
                    {exercise.category === 'strength' ? ' Силовое' : 
                     exercise.category === 'cardio' ? ' Кардио' : 
                     exercise.category === 'stretching' ? ' Растяжка' : ' Другое'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedExercise && (
        <div className={styles.modal} onClick={() => setSelectedExercise(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{selectedExercise.name}</h2>
            
            {selectedExercise.rutubeVideoId ? (
              <div className={styles.videoSection}>
                <RutubePlayer
                  videoId={selectedExercise.rutubeVideoId}
                  startTime={selectedExercise.rutubeStartTime || 0}
                  endTime={selectedExercise.rutubeEndTime}
                />
              </div>
            ) : (
              <div className={styles.noVideo}>Видео не доступно</div>
            )}
            
            <div className={styles.modalSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('description')}>
                <h3 className={styles.modalSubtitle}>Описание</h3>
                <button className={styles.expandButton}>
                  {expandedSections.description ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              <p className={styles.modalText}>
                {expandedSections.description 
                  ? selectedExercise.description 
                  : truncateText(selectedExercise.description, 100)}
              </p>
              {selectedExercise.description?.length > 100 && (
                <button 
                  className={styles.textToggle}
                  onClick={() => toggleSection('description')}
                >
                  {expandedSections.description ? 'Свернуть' : 'Читать далее'}
                </button>
              )}
            </div>
            
            <div className={styles.modalSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('muscles')}>
                <h3 className={styles.modalSubtitle}>Задействованные мышцы</h3>
                <button className={styles.expandButton}>
                  {expandedSections.muscles ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              <p className={styles.modalText}>
                {expandedSections.muscles 
                  ? selectedExercise.muscleGroup 
                  : truncateText(selectedExercise.muscleGroup, 50)}
              </p>
            </div>
            
            <div className={styles.modalSection}>
              <div className={styles.sectionHeader} onClick={() => toggleSection('instructions')}>
                <h3 className={styles.modalSubtitle}>Инструкция</h3>
                <button className={styles.expandButton}>
                  {expandedSections.instructions ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              <p className={styles.modalText}>
                {expandedSections.instructions 
                  ? selectedExercise.instructions 
                  : truncateText(selectedExercise.instructions, 100)}
              </p>
              {selectedExercise.instructions?.length > 100 && (
                <button 
                  className={styles.textToggle}
                  onClick={() => toggleSection('instructions')}
                >
                  {expandedSections.instructions ? 'Свернуть' : 'Читать далее'}
                </button>
              )}
            </div>
            
            {selectedExercise.commonMistakes && (
              <div className={styles.modalSection}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('mistakes')}>
                  <h3 className={styles.modalSubtitle}>Частые ошибки</h3>
                  <button className={styles.expandButton}>
                    {expandedSections.mistakes ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                <p className={styles.modalText}>
                  {expandedSections.mistakes 
                    ? selectedExercise.commonMistakes 
                    : truncateText(selectedExercise.commonMistakes, 100)}
                </p>
                {selectedExercise.commonMistakes?.length > 100 && (
                  <button 
                    className={styles.textToggle}
                    onClick={() => toggleSection('mistakes')}
                  >
                    {expandedSections.mistakes ? 'Свернуть' : 'Читать далее'}
                  </button>
                )}
              </div>
            )}
            
            <button 
              onClick={() => setSelectedExercise(null)}
              className={`btn ${styles.closeButton}`}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Exercises