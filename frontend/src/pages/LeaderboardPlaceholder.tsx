import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useAuthStore } from '../store/authStore'
import {
  leaderboardService,
  type LeaderboardPeriod,
  type LeaderboardResponse,
} from '../services/leaderboardService'

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'all-time', label: 'All Time' },
]

const GAME_MODES = [
  { value: '', label: 'All Modes' },
  { value: 'timed', label: 'Timed' },
  { value: 'word-count', label: 'Word Count' },
  { value: 'instant-death', label: 'Instant Death' },
  { value: 'multiplayer', label: 'Multiplayer' },
]

const PAGE_SIZE = 25

export default function LeaderboardPlaceholder() {
  const user = useAuthStore((state) => state.user)
  const [period, setPeriod] = useState<LeaderboardPeriod>('all-time')
  const [gameMode, setGameMode] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await leaderboardService.getLeaderboard({
        period,
        gameMode: gameMode || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setIsLoading(false)
    }
  }, [period, gameMode, page])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const handlePeriodChange = (newPeriod: LeaderboardPeriod) => {
    setPeriod(newPeriod)
    setPage(1)
  }

  const handleGameModeChange = (newMode: string) => {
    setGameMode(newMode)
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-[var(--color-amber-400)]' }
    if (rank === 2) return { icon: '🥈', color: 'text-gray-300' }
    if (rank === 3) return { icon: '🥉', color: 'text-amber-700' }
    return { icon: null, color: 'text-[var(--color-gray-500)]' }
  }

  const formatGameMode = (mode: string) => {
    const modeMap: Record<string, string> = {
      timed: 'Timed',
      'word-count': 'Word Count',
      'instant-death': 'Instant Death',
      multiplayer: 'Multiplayer',
    }
    return modeMap[mode] || mode
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 font-[var(--font-display)] text-4xl font-bold text-white">
              Leaderboard
            </h1>
            <p className="text-[var(--color-gray-400)]">
              Top typists from around the world
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-lg border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)] p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePeriodChange(p.value)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    period === p.value
                      ? 'bg-[var(--color-amber-500)] text-[var(--color-charcoal-950)]'
                      : 'text-[var(--color-gray-400)] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <select
              value={gameMode}
              onChange={(e) => handleGameModeChange(e.target.value)}
              className="rounded-lg border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)] px-4 py-2 text-sm text-white focus:border-[var(--color-amber-500)] focus:outline-none"
            >
              {GAME_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-900)]">
              <div className="animate-pulse">
                <div className="border-b border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)] px-6 py-4">
                  <div className="h-4 w-full rounded bg-[var(--color-charcoal-700)]" />
                </div>
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-b border-[var(--color-charcoal-800)] px-6 py-4 last:border-0"
                  >
                    <div className="h-4 w-12 rounded bg-[var(--color-charcoal-700)]" />
                    <div className="h-4 flex-1 rounded bg-[var(--color-charcoal-700)]" />
                    <div className="h-4 w-16 rounded bg-[var(--color-charcoal-700)]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
              <p className="mb-4 text-red-400">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              {data.entries.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-900)] p-12 text-center">
                  <div className="mb-4 text-5xl">🏆</div>
                  <p className="text-lg text-[var(--color-gray-400)]">
                    No results yet. Be the first to set a record!
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-block rounded-lg bg-[var(--color-amber-500)] px-6 py-2 font-medium text-[var(--color-charcoal-950)] transition-colors hover:bg-[var(--color-amber-400)]"
                  >
                    Start Typing
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-900)]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-gray-400)]">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-gray-400)]">
                          Player
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-gray-400)]">
                          WPM
                        </th>
                        <th className="hidden px-6 py-4 text-right text-sm font-semibold text-[var(--color-gray-400)] sm:table-cell">
                          Accuracy
                        </th>
                        <th className="hidden px-6 py-4 text-right text-sm font-semibold text-[var(--color-gray-400)] md:table-cell">
                          Mode
                        </th>
                        <th className="hidden px-6 py-4 text-right text-sm font-semibold text-[var(--color-gray-400)] lg:table-cell">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.map((entry) => {
                        const { icon, color } = getRankDisplay(entry.rank)
                        const isCurrentUser = user?.username === entry.username

                        return (
                          <tr
                            key={`${entry.username}-${entry.rank}`}
                            className={`border-b border-[var(--color-charcoal-800)] transition-colors last:border-0 ${
                              isCurrentUser
                                ? 'bg-[var(--color-amber-500)]/10'
                                : 'hover:bg-[var(--color-charcoal-800)]'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className={`font-[var(--font-mono)] font-bold ${color}`}>
                                {icon ? (
                                  <span className="mr-1">{icon}</span>
                                ) : (
                                  `#${entry.rank}`
                                )}
                                {icon && entry.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`font-medium ${
                                  isCurrentUser ? 'text-[var(--color-amber-400)]' : 'text-white'
                                }`}
                              >
                                {entry.username}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-[var(--color-amber-400)]">
                                    (you)
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-[var(--font-mono)] font-semibold text-white">
                              {entry.wpm}
                            </td>
                            <td className="hidden px-6 py-4 text-right font-[var(--font-mono)] text-[var(--color-gray-400)] sm:table-cell">
                              {entry.accuracy}%
                            </td>
                            <td className="hidden px-6 py-4 text-right text-sm text-[var(--color-gray-400)] md:table-cell">
                              {formatGameMode(entry.gameMode)}
                            </td>
                            <td className="hidden px-6 py-4 text-right text-sm text-[var(--color-gray-500)] lg:table-cell">
                              {entry.date}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-charcoal-700)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous
                  </button>

                  <span className="text-sm text-[var(--color-gray-400)]">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-charcoal-700)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-[var(--color-gray-500)]">
                {data.totalCount} total {data.totalCount === 1 ? 'result' : 'results'}
              </div>
            </>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[var(--color-gray-400)] transition-colors hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
