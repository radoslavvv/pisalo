import { apiClient } from '../lib/apiClient'
import type { LeaderboardEntry } from '../types'

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time'

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  totalCount: number
  page: number
  pageSize: number
}

export interface LeaderboardParams {
  gameMode?: string
  period?: LeaderboardPeriod
  page?: number
  pageSize?: number
}

export const leaderboardService = {
  async getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardResponse> {
    const searchParams = new URLSearchParams()

    if (params.gameMode) {
      searchParams.append('gameMode', params.gameMode)
    }
    if (params.period) {
      searchParams.append('period', params.period)
    }
    if (params.page) {
      searchParams.append('page', params.page.toString())
    }
    if (params.pageSize) {
      searchParams.append('pageSize', params.pageSize.toString())
    }

    const query = searchParams.toString()
    const endpoint = `/api/leaderboard${query ? `?${query}` : ''}`

    return apiClient.get<LeaderboardResponse>(endpoint)
  },
}
