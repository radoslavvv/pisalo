import { create } from 'zustand'

export interface User {
  id: string
  username: string
  avatar?: string
  isGuest: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
}

interface AuthActions {
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
  initialize: () => void
  setLoading: (isLoading: boolean) => void
}

type AuthStore = AuthState & AuthActions

const TOKEN_KEY = 'pisalo_auth_token'

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

const storeToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Failed to store token:', error)
  }
}

const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error('Failed to remove token:', error)
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: getStoredToken(),
  isLoading: false,
  isInitialized: false,

  setAuth: (user: User, token: string) => {
    storeToken(token)
    set({ user, token, isLoading: false })
  },

  setUser: (user: User) => {
    set({ user, isLoading: false })
  },

  logout: () => {
    removeToken()
    set({ user: null, token: null, isLoading: false })
  },

  initialize: () => {
    set({ isInitialized: true })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },
}))
