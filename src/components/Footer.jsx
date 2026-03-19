import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className='container'>
        <div className={styles.container_footer}>
          <Link to="/" className={styles.logo}>
            <img src="/public/icons/logotype.svg" alt="logotype" />
          </Link>

          <nav className={styles.nav}>
            <Link to="/workouts" className={styles.link}>Тренировки</Link>
            <Link to="/exercises" className={styles.link}>Упражнения</Link>
          </nav></div>
        <p className={styles.copyright}>© 2026 Все права защищены</p>
      </div>

    </footer >
  )
}

export default Footer