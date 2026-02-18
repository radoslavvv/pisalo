import { Link } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { useGameStats } from '../../hooks/useGameStats'

interface GameResultsProps {
  onRestart: () => void
}

export default function GameResults({ onRestart }: GameResultsProps) {
  const mode = useGameStore((state) => state.mode)
  const stats = useGameStats()

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
