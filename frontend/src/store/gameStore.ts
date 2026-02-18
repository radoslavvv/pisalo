import { create } from 'zustand'
import type { GameMode, GameState, CharacterState } from '../types'
import { getRandomWords } from '../mocks/words'

interface GameStore extends GameState {
  initGame: (mode: GameMode, option?: number) => void
  startCountdown: () => void
  startPlaying: () => void
  handleKeyPress: (key: string) => void
  endGame: () => void
  resetGame: () => void
}

const initialState: GameState = {
  mode: null,
  modeOption: null,
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  typedCharacters: [],
  status: 'idle',
  startTime: null,
  endTime: null,
  errors: 0,
  totalKeystrokes: 0,
  timeLimit: null,
  wordLimit: null,
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initGame: (mode: GameMode, option?: number) => {
    let wordCount: number
    let timeLimit: number | null = null
    let wordLimit: number | null = null

    switch (mode) {
      case 'timed':
        wordCount = 200
        timeLimit = option ?? 30
        break
      case 'word-count':
        wordCount = option ?? 25
        wordLimit = wordCount
        break
      case 'zen':
        wordCount = 100
        break
      case 'instant-death':
        wordCount = 200
        break
      case 'multiplayer':
        wordCount = 50
        break
      default:
        wordCount = 50
    }

    const words = getRandomWords(wordCount)
    const typedCharacters: CharacterState[][] = words.map(word =>
      Array(word.length).fill('pending')
    )

    set({
      ...initialState,
      mode,
      modeOption: option ?? null,
      words,
      typedCharacters,
      timeLimit,
      wordLimit,
      status: 'idle',
    })
  },

  startCountdown: () => {
    set({ status: 'countdown' })
  },

  startPlaying: () => {
    set({
      status: 'playing',
      startTime: Date.now(),
    })
  },

  handleKeyPress: (key: string) => {
    const state = get()
    if (state.status !== 'playing') return

    const { words, currentWordIndex, currentCharIndex, typedCharacters, mode } = state
    
    if (currentWordIndex >= words.length) {
      get().endGame()
      return
    }

    const currentWord = words[currentWordIndex]

    if (key === 'Backspace') {
      if (currentCharIndex > 0) {
        const newTypedCharacters = [...typedCharacters]
        newTypedCharacters[currentWordIndex] = [...newTypedCharacters[currentWordIndex]]
        newTypedCharacters[currentWordIndex][currentCharIndex - 1] = 'pending'
        
        set({
          currentCharIndex: currentCharIndex - 1,
          typedCharacters: newTypedCharacters,
        })
      }
      return
    }

    if (key === ' ') {
      if (currentCharIndex === currentWord.length) {
        const nextWordIndex = currentWordIndex + 1
        
        if (nextWordIndex >= words.length) {
          get().endGame()
          return
        }

        set({
          currentWordIndex: nextWordIndex,
          currentCharIndex: 0,
          totalKeystrokes: state.totalKeystrokes + 1,
        })
      } else if (currentCharIndex > 0) {
        const newTypedCharacters = [...typedCharacters]
        newTypedCharacters[currentWordIndex] = [...newTypedCharacters[currentWordIndex]]
        
        for (let i = currentCharIndex; i < currentWord.length; i++) {
          newTypedCharacters[currentWordIndex][i] = 'incorrect'
        }

        const skippedErrors = currentWord.length - currentCharIndex
        const nextWordIndex = currentWordIndex + 1

        if (nextWordIndex >= words.length) {
          set({
            typedCharacters: newTypedCharacters,
            errors: state.errors + skippedErrors,
            totalKeystrokes: state.totalKeystrokes + 1,
          })
          get().endGame()
          return
        }

        set({
          currentWordIndex: nextWordIndex,
          currentCharIndex: 0,
          typedCharacters: newTypedCharacters,
          errors: state.errors + skippedErrors,
          totalKeystrokes: state.totalKeystrokes + 1,
        })
      }
      return
    }

    if (key.length === 1) {
      if (currentCharIndex >= currentWord.length) return

      const isCorrect = key === currentWord[currentCharIndex]
      const newTypedCharacters = [...typedCharacters]
      newTypedCharacters[currentWordIndex] = [...newTypedCharacters[currentWordIndex]]
      newTypedCharacters[currentWordIndex][currentCharIndex] = isCorrect ? 'correct' : 'incorrect'

      const newErrors = isCorrect ? state.errors : state.errors + 1

      if (mode === 'instant-death' && !isCorrect) {
        set({
          typedCharacters: newTypedCharacters,
          errors: newErrors,
          totalKeystrokes: state.totalKeystrokes + 1,
        })
        get().endGame()
        return
      }

      set({
        currentCharIndex: currentCharIndex + 1,
        typedCharacters: newTypedCharacters,
        errors: newErrors,
        totalKeystrokes: state.totalKeystrokes + 1,
      })

      if (mode === 'word-count' && currentWordIndex === words.length - 1 && currentCharIndex + 1 === currentWord.length) {
        get().endGame()
      }
    }
  },

  endGame: () => {
    set({
      status: 'finished',
      endTime: Date.now(),
    })
  },

  resetGame: () => {
    const { mode, modeOption } = get()
    if (mode) {
      get().initGame(mode, modeOption ?? undefined)
    }
  },
}))
