import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { 
  MultiplayerLobby, 
  WaitingRoom, 
  MultiplayerGame, 
  MultiplayerResults 
} from '../components/multiplayer'
import { useMultiplayerStore } from '../store/multiplayerStore'

type MultiplayerPhase = 'lobby' | 'waiting' | 'playing' | 'results'

export default function MultiplayerPage() {
  const [phase, setPhase] = useState<MultiplayerPhase>('lobby')
  
  const connect = useMultiplayerStore((state) => state.connect)
  const connectionStatus = useMultiplayerStore((state) => state.connectionStatus)
  const roomStatus = useMultiplayerStore((state) => state.roomStatus)
  const reset = useMultiplayerStore((state) => state.reset)

  useEffect(() => {
    const token = localStorage.getItem('token') || undefined
    connect(token)
  }, [connect])

  useEffect(() => {
    if (roomStatus === 'countdown' || roomStatus === 'playing') {
      setPhase('playing')
    } else if (roomStatus === 'finished') {
      setPhase('results')
    }
  }, [roomStatus])

  const handleRoomCreated = useCallback(() => {
    setPhase('waiting')
  }, [])

  const handleRoomJoined = useCallback(() => {
    setPhase('waiting')
  }, [])

  const handleLeaveRoom = useCallback(() => {
    setPhase('lobby')
  }, [])

  const handleGameEnd = useCallback(() => {
    setPhase('results')
  }, [])

  const handlePlayAgain = useCallback(() => {
    reset()
    setPhase('lobby')
  }, [reset])

  const renderPhase = () => {
    switch (phase) {
      case 'lobby':
        return (
          <MultiplayerLobby 
            onRoomCreated={handleRoomCreated} 
            onRoomJoined={handleRoomJoined} 
          />
        )
      case 'waiting':
        return <WaitingRoom onLeave={handleLeaveRoom} />
      case 'playing':
        return <MultiplayerGame onGameEnd={handleGameEnd} />
      case 'results':
        return <MultiplayerResults onPlayAgain={handlePlayAgain} />
      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex items-center gap-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-charcoal-600)] text-[var(--color-gray-400)] transition-all hover:border-[var(--color-gray-500)] hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <h1 className="font-[var(--font-display)] text-2xl font-bold text-white">
                  Multiplayer
                </h1>
              </div>
              <p className="mt-1 text-sm text-[var(--color-gray-500)]">
                Challenge a friend to a 1v1 typing race
              </p>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`} />
              <span className="text-sm text-[var(--color-gray-500)]">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'reconnecting' ? 'Reconnecting...' :
                 'Disconnected'}
              </span>
            </div>
          </div>

          {renderPhase()}
        </div>
      </main>
      <Footer />
    </>
  )
}
