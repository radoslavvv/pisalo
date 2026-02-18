import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'

export function useTimer() {
  const status = useGameStore((state) => state.status)
  const startTime = useGameStore((state) => state.startTime)
  const timeLimit = useGameStore((state) => state.timeLimit)
  const mode = useGameStore((state) => state.mode)
  const endGame = useGameStore((state) => state.endGame)

  const [elapsed, setElapsed] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'idle' || status === 'countdown') {
      setElapsed(0)
      setRemaining(timeLimit)
      return
    }

    if (status !== 'playing' || !startTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - startTime) / 1000)
      setElapsed(elapsedSeconds)

      if (mode === 'timed' && timeLimit) {
        const remainingSeconds = Math.max(0, timeLimit - elapsedSeconds)
        setRemaining(remainingSeconds)

        if (remainingSeconds <= 0) {
          endGame()
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [status, startTime, timeLimit, mode, endGame])

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }, [])

  return {
    elapsed,
    remaining,
    formatTime,
    isTimedMode: mode === 'timed',
  }
}
