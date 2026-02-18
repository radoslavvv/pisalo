import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { useGameStats } from '../../hooks/useGameStats'
import { useAuthStore } from '../../store/authStore'
import { gameService } from '../../services/gameService'

interface GameResultsProps {
  onRestart: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function GameResults({ onRestart }: GameResultsProps) {
  const mode = useGameStore((state) => state.mode)
  const stats = useGameStats()
  const user = useAuthStore((state) => state.user)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const hasSaved = useRef(false)

  useEffect(() => {
    const saveResult = async () => {
      if (hasSaved.current) return
      if (!gameService.canSaveResult()) return
      if (mode === 'zen') return

      hasSaved.current = true
      setSaveStatus('saving')

      try {
        await gameService.saveResult({
          gameMode: mode || 'timed',
          wordsTyped: stats.wordsTyped,
          totalWords: stats.totalWords,
          errors: stats.errors,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          elapsedMs: stats.elapsedTime * 1000,
        })
        setSaveStatus('saved')
      } catch (error) {
        console.error('Failed to save result:', error)
        setSaveStatus('error')
      }
    }

    saveResult()
  }, [mode, stats])

  const ResultRow = ({ label, value, highlight = false }: { 
    label: string
    value: string | number
    highlight?: boolean 
  }) => (
    <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${
      highlight ? 'bg-[var(--color-amber-500)]/10' : 'bg-[var(--color-charcoal-800)]/50'
    }`}>
      <span className="text-[var(--color-gray-400)]">{label}</span>
      <span className={`font-[var(--font-mono)] text-lg font-semibold ${
        highlight ? 'text-[var(--color-amber-400)]' : 'text-white'
      }`}>
        {value}
      </span>
    </div>
  )

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/30 p-6">
      <div className="mb-6 text-center">
        <div className="mb-2 text-6xl">
          {mode === 'instant-death' && stats.errors > 0 ? '💀' : '🎉'}
        </div>
        <h2 className="font-[var(--font-display)] text-2xl font-bold text-white">
          {mode === 'instant-death' && stats.errors > 0 ? 'Game Over!' : 'Great Job!'}
        </h2>
      </div>

      <div className="mb-6 space-y-2">
        <ResultRow label="WPM" value={stats.wpm} highlight />
        <ResultRow label="Raw WPM" value={stats.rawWpm} />
        <ResultRow label="Accuracy" value={`${stats.accuracy}%`} />
        <ResultRow label="Time" value={formatTime(stats.elapsedTime)} />
        <ResultRow label="Words Typed" value={stats.wordsTyped} />
        <ResultRow label="Errors" value={stats.errors} />
      </div>

      {mode !== 'zen' && (
        <div className="mb-6">
          {saveStatus === 'saving' && (
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-gray-400)]">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving to leaderboard...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Result saved to leaderboard!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Failed to save result
            </div>
          )}
          {saveStatus === 'idle' && !user && (
            <div className="text-center text-sm text-[var(--color-gray-400)]">
              <Link to="/" className="text-[var(--color-amber-400)] hover:underline">
                Sign in
              </Link>{' '}
              to save your scores to the leaderboard
            </div>
          )}
          {saveStatus === 'idle' && user?.isGuest && (
            <div className="text-center text-sm text-[var(--color-gray-400)]">
              Guest scores are not saved to the leaderboard
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 rounded-xl bg-[var(--color-amber-500)] px-6 py-3 font-semibold text-[var(--color-charcoal-950)] transition-all hover:bg-[var(--color-amber-400)]"
        >
          Try Again
        </button>
        <Link
          to="/"
          className="flex-1 rounded-xl border border-[var(--color-charcoal-600)] px-6 py-3 text-center font-semibold text-white transition-all hover:border-[var(--color-gray-500)] hover:bg-[var(--color-charcoal-700)]"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
