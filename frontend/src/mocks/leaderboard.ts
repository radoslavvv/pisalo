import type { LeaderboardEntry } from '../types'

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'speedtyper99',
    wpm: 156,
    accuracy: 98.5,
    date: '2026-02-18',
    gameMode: 'timed'
  },
  {
    rank: 2,
    username: 'keymaster',
    wpm: 142,
    accuracy: 97.2,
    date: '2026-02-17',
    gameMode: 'timed'
  },
  {
    rank: 3,
    username: 'quickfingers',
    wpm: 138,
    accuracy: 99.1,
    date: '2026-02-18',
    gameMode: 'timed'
  },
  {
    rank: 4,
    username: 'typingpro',
    wpm: 131,
    accuracy: 96.8,
    date: '2026-02-16',
    gameMode: 'timed'
  },
  {
    rank: 5,
    username: 'fastkeys',
    wpm: 127,
    accuracy: 95.4,
    date: '2026-02-18',
    gameMode: 'timed'
  }
]

export const mockDailyStats = {
  totalGames: 1247,
  averageWpm: 68,
  topWpm: 156
}
