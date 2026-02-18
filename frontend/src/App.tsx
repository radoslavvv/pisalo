import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import GamePlaceholder from './pages/GamePlaceholder'
import LeaderboardPlaceholder from './pages/LeaderboardPlaceholder'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game/:mode" element={<GamePlaceholder />} />
      <Route path="/leaderboard" element={<LeaderboardPlaceholder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
