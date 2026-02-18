import { useState } from 'react'
import { useMultiplayerStore } from '../../store/multiplayerStore'

interface MultiplayerLobbyProps {
  onRoomCreated: () => void
  onRoomJoined: () => void
}

export default function MultiplayerLobby({ onRoomCreated, onRoomJoined }: MultiplayerLobbyProps) {
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  
  const createRoom = useMultiplayerStore((state) => state.createRoom)
  const joinRoom = useMultiplayerStore((state) => state.joinRoom)
  const error = useMultiplayerStore((state) => state.error)
  const clearError = useMultiplayerStore((state) => state.clearError)
  const connectionStatus = useMultiplayerStore((state) => state.connectionStatus)

  const handleCreateRoom = async () => {
    setIsCreating(true)
    clearError()
    try {
      await createRoom()
      onRoomCreated()
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return
    
    setIsJoining(true)
    clearError()
    try {
      const success = await joinRoom(joinCode.trim())
      if (success) {
        onRoomJoined()
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom()
    }
  }

  const isConnected = connectionStatus === 'connected'

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/30 p-8">
      <div className="mb-8 text-center">
        <div className="mb-3 text-5xl">👥</div>
        <h2 className="font-[var(--font-display)] text-2xl font-bold text-white">
          Multiplayer
        </h2>
        <p className="mt-2 text-[var(--color-gray-400)]">
          Challenge a friend to a 1v1 typing race
        </p>
      </div>

      {!isConnected && (
        <div className="mb-6 rounded-lg bg-[var(--color-amber-500)]/10 p-4 text-center">
          <p className="text-[var(--color-amber-400)]">
            {connectionStatus === 'connecting' ? 'Connecting to server...' : 
             connectionStatus === 'reconnecting' ? 'Reconnecting...' : 
             'Not connected to server'}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4">
          <p className="text-center text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Create a Room</h3>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !isConnected}
            className="w-full rounded-xl bg-[var(--color-amber-500)] px-6 py-4 font-semibold text-[var(--color-charcoal-950)] transition-all hover:bg-[var(--color-amber-400)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create New Room'}
          </button>
          <p className="mt-2 text-center text-sm text-[var(--color-gray-500)]">
            You'll get a code to share with your opponent
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--color-charcoal-600)]" />
          <span className="text-[var(--color-gray-500)]">or</span>
          <div className="h-px flex-1 bg-[var(--color-charcoal-600)]" />
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">Join a Room</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter room code"
              maxLength={6}
              disabled={!isConnected}
              className="flex-1 rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/50 px-4 py-4 font-[var(--font-mono)] text-lg uppercase tracking-widest text-white placeholder-[var(--color-gray-600)] focus:border-[var(--color-amber-500)] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinCode.trim() || !isConnected}
              className="rounded-xl border border-[var(--color-charcoal-600)] px-6 py-4 font-semibold text-white transition-all hover:border-[var(--color-amber-500)] hover:bg-[var(--color-charcoal-700)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
