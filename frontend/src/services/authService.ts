import { apiClient } from '../lib/apiClient'
import { useAuthStore, type User } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    avatar?: string
    isGuest: boolean
  }
}

interface UserResponse {
  id: string
  username: string
  avatar?: string
  isGuest: boolean
}

export const authService = {
  loginWithGitHub(): void {
    window.location.href = `${API_URL}/api/auth/login/github`
  },

  async loginAsGuest(username?: string): Promise<void> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/guest',
      { username: username || undefined }
    )

    const user: User = {
      id: response.user.id,
      username: response.user.username,
      avatar: response.user.avatar,
      isGuest: response.user.isGuest,
    }

    useAuthStore.getState().setAuth(user, response.token)
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await apiClient.get<UserResponse>('/api/auth/me', token)

    return {
      id: response.id,
      username: response.username,
      avatar: response.avatar,
      isGuest: response.isGuest,
    }
  },

  async logout(): Promise<void> {
    const token = useAuthStore.getState().token

    if (token) {
      try {
        await apiClient.post('/api/auth/logout', undefined, token)
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }

    useAuthStore.getState().logout()
  },

  async initializeAuth(): Promise<void> {
    const token = useAuthStore.getState().token

    if (!token) {
      useAuthStore.getState().initialize()
      return
    }

    try {
      useAuthStore.getState().setLoading(true)
      const user = await this.getCurrentUser(token)
      useAuthStore.getState().setUser(user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      useAuthStore.getState().logout()
    } finally {
      useAuthStore.getState().initialize()
    }
  },
}
