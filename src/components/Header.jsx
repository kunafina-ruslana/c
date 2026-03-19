import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { FaUser, FaSun, FaMoon, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa'
import styles from './Header.module.css'
import logoSvg from '../../public/icons/logotype.svg';

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={` ${styles.container}`}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <img src={logoSvg} alt="logotype" />
        </Link>

        {isMobile ? (
          <>
            <button onClick={toggleMenu} className={styles.burgerButton}>
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {isMenuOpen && (
              <div className={styles.mobileMenu}>
                <nav className={styles.mobileNav}>
                  <Link to="/workouts" className={styles.mobileLink} onClick={closeMenu}>
                    Тренировки
                  </Link>
                  <Link to="/exercises" className={styles.mobileLink} onClick={closeMenu}>
                    Упражнения
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className={styles.mobileLink} onClick={closeMenu}>
                        Профиль
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className={styles.mobileLink} onClick={closeMenu}>
                          Админ панель
                        </Link>
                      )}
                      {user?.role === 'trainer' && (
                        <Link to="/trainer" className={styles.mobileLink}>
                          Панель тренера
                        </Link>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                  <button onClick={toggleTheme} className={styles.mobileThemeButton}>
                    {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
                    <span>{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
                  </button>

                  {isAuthenticated ? (
                    <>
                      <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                        <FaSignOutAlt size={18} />
                        <span>Выйти</span>
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className={styles.mobileLink} onClick={closeMenu}>
                      Войти
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className={styles.nav}>
            <Link to="/workouts" className={styles.link}>Тренировки</Link>
            <Link to="/exercises" className={styles.link}>Упражнения</Link>

            {isAuthenticated ? (
              <div className={styles.userMenu}>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={styles.link}>Админ панель</Link>
                )}

                {user?.role === 'trainer' && (
                  <Link to="/trainer" className={styles.link}>
                    Панель тренера
                  </Link>
                )}
              </div>
            ) : (
              <></>
            )}
            <button onClick={toggleTheme} className={styles.themeButton}>
              {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
            </button>
            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <Link to="/profile" className={styles.iconButton}>
                  <FaUser size={20} />
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  <FaSignOutAlt size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.iconButton}>
                <FaUser size={20} />
              </Link>
            )}

          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
