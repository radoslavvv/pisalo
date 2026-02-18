import { apiClient } from '../lib/apiClient'
import { useAuthStore } from '../store/authStore'

export interface SaveGameResultRequest {
  gameMode: string
  wordsTyped: number
  totalWords: number
  errors: number
  wpm: number
  accuracy: number
  elapsedMs: number
}

export const gameService = {
  async saveResult(result: SaveGameResultRequest): Promise<void> {
    const token = useAuthStore.getState().token

    if (!token) {
      throw new Error('User not authenticated')
    }

    await apiClient.post('/api/games/results', result, token)
  },

  canSaveResult(): boolean {
    const { user, token } = useAuthStore.getState()
    return !!token && !!user && !user.isGuest
  },
}
