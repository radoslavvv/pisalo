import { useMultiplayerStore } from '../../store/multiplayerStore'

interface WaitingRoomProps {
  onLeave: () => void
}

export default function WaitingRoom({ onLeave }: WaitingRoomProps) {
  const roomCode = useMultiplayerStore((state) => state.roomCode)
  const isHost = useMultiplayerStore((state) => state.isHost)
  const host = useMultiplayerStore((state) => state.host)
  const opponent = useMultiplayerStore((state) => state.opponent)
  const startGame = useMultiplayerStore((state) => state.startGame)
  const leaveRoom = useMultiplayerStore((state) => state.leaveRoom)
  const error = useMultiplayerStore((state) => state.error)

  const handleLeave = async () => {
    await leaveRoom()
    onLeave()
  }

  const handleStart = async () => {
    await startGame()
  }

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
    }
  }

  const canStart = isHost && opponent !== null

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/30 p-8">
      <div className="mb-8 text-center">
        <div className="mb-3 text-5xl">⏳</div>
        <h2 className="font-[var(--font-display)] text-2xl font-bold text-white">
          {isHost ? 'Waiting for Opponent' : 'Waiting for Host'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4">
          <p className="text-center text-red-400">{error}</p>
        </div>
      )}

      {isHost && (
        <div className="mb-8">
          <p className="mb-2 text-center text-[var(--color-gray-400)]">
            Share this code with your opponent
          </p>
          <div 
            className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)] p-4 transition-all hover:border-[var(--color-amber-500)]"
            onClick={handleCopyCode}
          >
            <span className="font-[var(--font-mono)] text-4xl font-bold tracking-[0.3em] text-[var(--color-amber-400)]">
              {roomCode}
            </span>
            <svg className="h-6 w-6 text-[var(--color-gray-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-2 text-center text-sm text-[var(--color-gray-500)]">
            Click to copy
          </p>
        </div>
      )}

      <div className="mb-8 space-y-3">
        <h3 className="text-center text-lg font-semibold text-white">Players</h3>
        
        <div className="flex items-center justify-between rounded-lg bg-[var(--color-charcoal-800)]/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-amber-500)]/20">
              <span className="text-lg">👑</span>
            </div>
            <div>
              <p className="font-semibold text-white">{host?.username || 'Host'}</p>
              <p className="text-sm text-[var(--color-gray-500)]">Host</p>
            </div>
          </div>
          <span className="text-green-400">Ready</span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[var(--color-charcoal-800)]/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-charcoal-700)]">
              <span className="text-lg">{opponent ? '👤' : '❓'}</span>
            </div>
            <div>
              <p className="font-semibold text-white">
                {opponent?.username || 'Waiting...'}
              </p>
              <p className="text-sm text-[var(--color-gray-500)]">Guest</p>
            </div>
          </div>
          {opponent ? (
            <span className="text-green-400">Ready</span>
          ) : (
            <span className="animate-pulse text-[var(--color-gray-500)]">Waiting</span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {isHost && (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="flex-1 rounded-xl bg-[var(--color-amber-500)] px-6 py-3 font-semibold text-[var(--color-charcoal-950)] transition-all hover:bg-[var(--color-amber-400)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canStart ? 'Start Game' : 'Waiting for Opponent...'}
          </button>
        )}
        {!isHost && (
          <div className="flex-1 rounded-xl bg-[var(--color-charcoal-700)] px-6 py-3 text-center font-semibold text-[var(--color-gray-400)]">
            Waiting for host to start...
          </div>
        )}
        <button
          onClick={handleLeave}
          className="rounded-xl border border-[var(--color-charcoal-600)] px-6 py-3 font-semibold text-white transition-all hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          Leave
        </button>
      </div>
    </div>
  )
}
