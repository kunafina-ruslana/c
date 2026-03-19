import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Workouts from './pages/Workouts'
import WorkoutDetail from './pages/WorkoutDetail'
import Exercises from './pages/Exercises'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminPanel from './pages/AdminPanel'
import TrainerPanel from './pages/TrainerPanel'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/:id" element={<WorkoutDetail />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/trainer" element={
            <PrivateRoute trainerOnly>
              <TrainerPanel />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminPanel />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg)',
            color: 'var(--text)',
          },
        }}
      />
    </>
  )
}

export default App