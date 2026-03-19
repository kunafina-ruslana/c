import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PrivateRoute = ({ children, adminOnly = false, trainerOnly = false }) => {
  const { isAuthenticated, isAdmin, isTrainer, loading } = useAuth()

  if (loading) {
    return <div style={styles.loading}>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />
  }

  if (trainerOnly && !isTrainer && !isAdmin) {
    return <Navigate to="/" />
  }

  return children
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: 'var(--text-primary)'
  }
}

export default PrivateRoute