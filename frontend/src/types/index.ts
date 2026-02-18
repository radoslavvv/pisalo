export type GameMode = 'timed' | 'word-count' | 'zen' | 'instant-death' | 'multiplayer'

export interface GameModeOption {
  label: string
  value: string | number
}

export interface GameModeConfig {
  id: GameMode
  name: string
  description: string
  icon: string
  options?: GameModeOption[]
}

export interface LeaderboardEntry {
  rank: number
  username: string
  wpm: number
  accuracy: number
  date: string
  gameMode: GameMode
}

export interface User {
  id: string
  username: string
  avatar?: string
  isGuest: boolean
}
