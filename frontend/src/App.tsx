import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import GamePage from './pages/GamePage'
import MultiplayerPage from './pages/MultiplayerPage'
import LeaderboardPlaceholder from './pages/LeaderboardPlaceholder'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { authService } from './services/authService'

function App() {
  useEffect(() => {
    authService.initializeAuth()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/game/multiplayer" element={<MultiplayerPage />} />
      <Route path="/game/:mode" element={<GamePage />} />
      <Route path="/leaderboard" element={<LeaderboardPlaceholder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
