import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import type { GameStats } from '../types'

export function useGameStats(): GameStats {
  const words = useGameStore((state) => state.words)
  const currentWordIndex = useGameStore((state) => state.currentWordIndex)
  const typedCharacters = useGameStore((state) => state.typedCharacters)
  const startTime = useGameStore((state) => state.startTime)
  const endTime = useGameStore((state) => state.endTime)
  const errors = useGameStore((state) => state.errors)
  const totalKeystrokes = useGameStore((state) => state.totalKeystrokes)
  const status = useGameStore((state) => state.status)

  return useMemo(() => {
    const now = endTime ?? Date.now()
    const elapsedMs = startTime ? now - startTime : 0
    const elapsedMinutes = Math.max(elapsedMs / 60000, 0.01)
    const elapsedSeconds = Math.floor(elapsedMs / 1000)

    let correctChars = 0
    let totalTypedChars = 0

    typedCharacters.forEach((word) => {
      word.forEach((char) => {
        if (char === 'correct') {
          correctChars++
          totalTypedChars++
        } else if (char === 'incorrect') {
          totalTypedChars++
        }
      })
    })

    const wordsTyped = currentWordIndex
    const totalWords = words.length

    const wpm = status === 'idle' ? 0 : Math.round((correctChars / 5) / elapsedMinutes)
    const rawWpm = status === 'idle' ? 0 : Math.round((totalTypedChars / 5) / elapsedMinutes)
    const accuracy = totalKeystrokes > 0 
      ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) 
      : 100

    return {
      wpm: Math.max(0, wpm),
      rawWpm: Math.max(0, rawWpm),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      elapsedTime: elapsedSeconds,
      wordsTyped,
      totalWords,
      errors,
    }
  }, [words, currentWordIndex, typedCharacters, startTime, endTime, errors, totalKeystrokes, status])
}
