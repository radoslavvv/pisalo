import { Link } from 'react-router-dom'
import { useMultiplayerStore } from '../../store/multiplayerStore'

interface MultiplayerResultsProps {
  onPlayAgain: () => void
}

export default function MultiplayerResults({ onPlayAgain }: MultiplayerResultsProps) {
  const gameResult = useMultiplayerStore((state) => state.gameResult)
  const currentUserId = useMultiplayerStore((state) => state.currentUserId)
  const reset = useMultiplayerStore((state) => state.reset)

  if (!gameResult) {
    return (
      <div className="animate-fade-in-up rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/30 p-8 text-center">
        <p className="text-[var(--color-gray-400)]">Loading results...</p>
      </div>
    )
  }

  const { winner, loser } = gameResult
  const isWinner = winner.id === currentUserId

  const ResultCard = ({ player, isTop }: { player: typeof winner, isTop: boolean }) => (
    <div className={`rounded-xl border p-6 ${
      player.isWinner 
        ? 'border-[var(--color-amber-500)] bg-[var(--color-amber-500)]/10' 
        : 'border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/30'
    }`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            player.isWinner ? 'bg-[var(--color-amber-500)]/20' : 'bg-[var(--color-charcoal-700)]'
          }`}>
            <span className="text-2xl">{player.isWinner ? '👑' : '👤'}</span>
          </div>
          <div>
            <p className={`text-lg font-bold ${player.isWinner ? 'text-[var(--color-amber-400)]' : 'text-white'}`}>
              {player.username}
            </p>
            <p className="text-sm text-[var(--color-gray-500)]">
              {player.isWinner ? 'Winner' : '2nd Place'}
            </p>
          </div>
        </div>
        {isTop && (
          <div className="text-4xl">{player.isWinner ? '🏆' : ''}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[var(--color-charcoal-800)]/50 p-3">
          <p className="text-sm text-[var(--color-gray-500)]">WPM</p>
          <p className={`font-[var(--font-mono)] text-xl font-bold ${
            player.isWinner ? 'text-[var(--color-amber-400)]' : 'text-white'
          }`}>
            {Math.round(player.wpm)}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-charcoal-800)]/50 p-3">
          <p className="text-sm text-[var(--color-gray-500)]">Accuracy</p>
          <p className="font-[var(--font-mono)] text-xl font-bold text-white">
            {Math.round(player.accuracy)}%
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-charcoal-800)]/50 p-3">
          <p className="text-sm text-[var(--color-gray-500)]">Words</p>
          <p className="font-[var(--font-mono)] text-xl font-bold text-white">
            {player.wordsTyped}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-charcoal-800)]/50 p-3">
          <p className="text-sm text-[var(--color-gray-500)]">Time</p>
          <p className="font-[var(--font-mono)] text-xl font-bold text-white">
            {(player.elapsedMs / 1000).toFixed(1)}s
          </p>
        </div>
      </div>
    </div>
  )

  const handlePlayAgain = () => {
    reset()
    onPlayAgain()
  }

  const handleGoHome = () => {
    reset()
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center">
        <div className="mb-3 text-6xl">
          {isWinner ? '🎉' : '😢'}
        </div>
        <h2 className="font-[var(--font-display)] text-3xl font-bold text-white">
          {isWinner ? 'Victory!' : 'Defeated'}
        </h2>
        <p className="mt-2 text-[var(--color-gray-400)]">
          {isWinner ? 'You won the race!' : 'Better luck next time!'}
        </p>
      </div>

      <div className="space-y-4">
        <ResultCard player={winner} isTop={true} />
        <ResultCard player={loser} isTop={false} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePlayAgain}
          className="flex-1 rounded-xl bg-[var(--color-amber-500)] px-6 py-3 font-semibold text-[var(--color-charcoal-950)] transition-all hover:bg-[var(--color-amber-400)]"
        >
          Play Again
        </button>
        <Link
          to="/"
          onClick={handleGoHome}
          className="flex-1 rounded-xl border border-[var(--color-charcoal-600)] px-6 py-3 text-center font-semibold text-white transition-all hover:border-[var(--color-gray-500)] hover:bg-[var(--color-charcoal-700)]"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
