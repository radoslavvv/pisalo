import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import GamePage from './pages/GamePage'
import MultiplayerPage from './pages/MultiplayerPage'
import LeaderboardPlaceholder from './pages/LeaderboardPlaceholder'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game/multiplayer" element={<MultiplayerPage />} />
      <Route path="/game/:mode" element={<GamePage />} />
      <Route path="/leaderboard" element={<LeaderboardPlaceholder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
