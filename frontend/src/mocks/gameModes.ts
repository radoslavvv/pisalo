import type { GameModeConfig } from '../types'

export const gameModes: GameModeConfig[] = [
  {
    id: 'timed',
    name: 'Timed Mode',
    description: 'Race against the clock. Type as many words as you can before time runs out.',
    icon: '⏱️',
    options: [
      { label: '15s', value: 15 },
      { label: '30s', value: 30 },
      { label: '60s', value: 60 }
    ]
  },
  {
    id: 'word-count',
    name: 'Word Count',
    description: 'Complete a set number of words as fast as possible. No time pressure.',
    icon: '📝',
    options: [
      { label: '25 words', value: 25 },
      { label: '50 words', value: 50 },
      { label: '100 words', value: 100 }
    ]
  },
  {
    id: 'zen',
    name: 'Zen Mode',
    description: 'Relax and practice. No timer, no stats, just pure typing flow.',
    icon: '🧘',
  },
  {
    id: 'instant-death',
    name: 'Instant Death',
    description: 'One mistake and it\'s game over. How far can you go with perfect accuracy?',
    icon: '💀',
  },
  {
    id: 'multiplayer',
    name: 'Multiplayer',
    description: 'Challenge friends or strangers in real-time typing races.',
    icon: '👥',
  }
]
