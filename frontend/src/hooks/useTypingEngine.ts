import { useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'

export function useTypingEngine() {
  const status = useGameStore((state) => state.status)
  const handleKeyPress = useGameStore((state) => state.handleKeyPress)

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (status !== 'playing') return

      if (event.key === ' ') {
        event.preventDefault()
      }

      if (
        event.key === 'Backspace' ||
        event.key === ' ' ||
        (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey)
      ) {
        handleKeyPress(event.key)
      }
    },
    [status, handleKeyPress]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])
}
