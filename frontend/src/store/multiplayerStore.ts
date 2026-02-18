import { create } from 'zustand'
import type { 
  Player, 
  PlayerProgress, 
  PlayerResult, 
  GameEndedResult, 
  ConnectionStatus, 
  RoomStatus,
  CharacterState 
} from '../types'
import { signalRService } from '../services/signalRService'

interface MultiplayerState {
  connectionStatus: ConnectionStatus
  roomCode: string | null
  isHost: boolean
  host: Player | null
  opponent: Player | null
  opponentProgress: PlayerProgress | null
  roomStatus: RoomStatus
  words: string[]
  currentWordIndex: number
  currentCharIndex: number
  typedCharacters: CharacterState[][]
  startTime: number | null
  errors: number
  totalKeystrokes: number
  gameResult: GameEndedResult | null
  error: string | null
}

interface MultiplayerActions {
  connect: (token?: string) => Promise<void>
  disconnect: () => Promise<void>
  createRoom: () => Promise<void>
  joinRoom: (roomCode: string) => Promise<boolean>
  leaveRoom: () => Promise<void>
  startGame: () => Promise<void>
  handleKeyPress: (key: string) => void
  sendProgress: () => Promise<void>
  finishGame: (stats: { wordsTyped: number; totalWords: number; errors: number; wpm: number; accuracy: number; elapsedMs: number }) => Promise<void>
  reset: () => void
  clearError: () => void
}

const initialState: MultiplayerState = {
  connectionStatus: 'disconnected',
  roomCode: null,
  isHost: false,
  host: null,
  opponent: null,
  opponentProgress: null,
  roomStatus: 'idle',
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  typedCharacters: [],
  startTime: null,
  errors: 0,
  totalKeystrokes: 0,
  gameResult: null,
  error: null,
}

export const useMultiplayerStore = create<MultiplayerState & MultiplayerActions>((set, get) => {
  const setupListeners = () => {
    signalRService.on('connectionStatus', (status) => {
      set({ connectionStatus: status })
    })

    signalRService.on('error', (error) => {
      set({ error })
    })

    signalRService.on('playerJoined', (player) => {
      set({ opponent: player })
    })

    signalRService.on('joinFailed', (reason) => {
      set({ error: reason, roomStatus: 'idle' })
    })

    signalRService.on('playerLeft', () => {
      set({ opponent: null, opponentProgress: null })
    })

    signalRService.on('roomClosed', (reason) => {
      set({ 
        ...initialState, 
        connectionStatus: get().connectionStatus,
        error: reason 
      })
    })

    signalRService.on('gameStarting', () => {
      set({ roomStatus: 'countdown' })
    })

    signalRService.on('gameStarted', ({ words, startTime }) => {
      const typedCharacters: CharacterState[][] = words.map(word =>
        Array(word.length).fill('pending')
      )
      set({ 
        roomStatus: 'playing', 
        words, 
        startTime,
        currentWordIndex: 0,
        currentCharIndex: 0,
        typedCharacters,
        errors: 0,
        totalKeystrokes: 0,
      })
    })

    signalRService.on('opponentProgress', (progress) => {
      set({ opponentProgress: progress })
    })

    signalRService.on('opponentFinished', (result) => {
      set({ 
        opponentProgress: { 
          ...get().opponentProgress!,
          isFinished: true 
        } 
      })
    })

    signalRService.on('gameEnded', (result) => {
      set({ roomStatus: 'finished', gameResult: result })
    })
  }

  return {
    ...initialState,

    connect: async (token?: string) => {
      setupListeners()
      await signalRService.connect(token)
    },

    disconnect: async () => {
      await signalRService.disconnect()
      set(initialState)
    },

    createRoom: async () => {
      try {
        const response = await signalRService.createRoom()
        set({ 
          roomCode: response.roomCode, 
          host: response.host,
          isHost: true,
          roomStatus: 'waiting',
          error: null,
        })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to create room' })
      }
    },

    joinRoom: async (roomCode: string) => {
      try {
        const response = await signalRService.joinRoom(roomCode.toUpperCase())
        if (response) {
          set({ 
            roomCode: response.roomCode, 
            host: response.host,
            opponent: response.host,
            isHost: false,
            roomStatus: 'waiting',
            error: null,
          })
          return true
        }
        return false
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to join room' })
        return false
      }
    },

    leaveRoom: async () => {
      await signalRService.leaveRoom()
      set({ 
        roomCode: null, 
        host: null,
        opponent: null, 
        isHost: false, 
        roomStatus: 'idle',
        words: [],
        opponentProgress: null,
        gameResult: null,
      })
    },

    startGame: async () => {
      try {
        await signalRService.startGame()
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to start game' })
      }
    },

    handleKeyPress: (key: string) => {
      const state = get()
      if (state.roomStatus !== 'playing') return

      const { words, currentWordIndex, currentCharIndex, typedCharacters } = state
      
      if (currentWordIndex >= words.length) return

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
          
          if (nextWordIndex >= words.length) return

          set({
            currentWordIndex: nextWordIndex,
            currentCharIndex: 0,
            totalKeystrokes: state.totalKeystrokes + 1,
          })
          
          get().sendProgress()
        } else if (currentCharIndex > 0) {
          const newTypedCharacters = [...typedCharacters]
          newTypedCharacters[currentWordIndex] = [...newTypedCharacters[currentWordIndex]]
          
          let skippedErrors = 0
          for (let i = currentCharIndex; i < currentWord.length; i++) {
            newTypedCharacters[currentWordIndex][i] = 'incorrect'
            skippedErrors++
          }

          const nextWordIndex = currentWordIndex + 1

          if (nextWordIndex >= words.length) {
            set({
              typedCharacters: newTypedCharacters,
              errors: state.errors + skippedErrors,
              totalKeystrokes: state.totalKeystrokes + 1,
            })
            return
          }

          set({
            currentWordIndex: nextWordIndex,
            currentCharIndex: 0,
            typedCharacters: newTypedCharacters,
            errors: state.errors + skippedErrors,
            totalKeystrokes: state.totalKeystrokes + 1,
          })
          
          get().sendProgress()
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

        set({
          currentCharIndex: currentCharIndex + 1,
          typedCharacters: newTypedCharacters,
          errors: newErrors,
          totalKeystrokes: state.totalKeystrokes + 1,
        })
      }
    },

    sendProgress: async () => {
      const state = get()
      const elapsed = state.startTime ? Date.now() - state.startTime : 0
      const minutes = elapsed / 60000
      const wpm = minutes > 0 ? Math.round(state.currentWordIndex / minutes) : 0

      await signalRService.updateProgress({
        currentWordIndex: state.currentWordIndex,
        currentCharIndex: state.currentCharIndex,
        wpm,
        errors: state.errors,
        isFinished: false,
      })
    },

    finishGame: async (stats) => {
      await signalRService.playerFinished(stats)
    },

    reset: () => {
      set({
        roomCode: null,
        isHost: false,
        host: null,
        opponent: null,
        opponentProgress: null,
        roomStatus: 'idle',
        words: [],
        currentWordIndex: 0,
        currentCharIndex: 0,
        typedCharacters: [],
        startTime: null,
        errors: 0,
        totalKeystrokes: 0,
        gameResult: null,
        error: null,
      })
    },

    clearError: () => {
      set({ error: null })
    },
  }
})
