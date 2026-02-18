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

export type CharacterState = 'pending' | 'correct' | 'incorrect'

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'finished'

export interface GameState {
  mode: GameMode | null
  modeOption: number | null
  words: string[]
  currentWordIndex: number
  currentCharIndex: number
  typedCharacters: CharacterState[][]
  status: GameStatus
  startTime: number | null
  endTime: number | null
  errors: number
  totalKeystrokes: number
  timeLimit: number | null
  wordLimit: number | null
}

export interface GameStats {
  wpm: number
  rawWpm: number
  accuracy: number
  elapsedTime: number
  wordsTyped: number
  totalWords: number
  errors: number
}

export interface Player {
  id: string
  username: string
}

export interface PlayerProgress {
  playerId: string
  username: string
  currentWordIndex: number
  currentCharIndex: number
  wpm: number
  errors: number
  isFinished: boolean
}

export interface PlayerResult {
  id: string
  username: string
  wordsTyped: number
  wpm: number
  accuracy: number
  elapsedMs: number
  isWinner: boolean
}

export interface GameEndedResult {
  winner: PlayerResult
  loser: PlayerResult
}

export type RoomStatus = 'idle' | 'waiting' | 'countdown' | 'playing' | 'finished'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
