import type { PlayerProgress } from '../../types'

interface OpponentProgressProps {
  progress: PlayerProgress | null
  totalWords: number
}

export default function OpponentProgress({ progress, totalWords }: OpponentProgressProps) {
  const percentage = progress 
    ? Math.min(100, (progress.currentWordIndex / totalWords) * 100) 
    : 0

  return (
    <div className="rounded-lg border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">👤</span>
          <span className="font-semibold text-white">
            {progress?.username || 'Opponent'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-gray-400)]">
            <span className="font-[var(--font-mono)] text-[var(--color-amber-400)]">
              {progress?.wpm || 0}
            </span> WPM
          </span>
          <span className="text-[var(--color-gray-400)]">
            <span className="font-[var(--font-mono)] text-white">
              {progress?.currentWordIndex || 0}
            </span>/{totalWords} words
          </span>
        </div>
      </div>
      
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-charcoal-700)]">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {progress?.isFinished && (
        <div className="mt-2 text-center text-sm text-green-400">
          Finished!
        </div>
      )}
    </div>
  )
}
