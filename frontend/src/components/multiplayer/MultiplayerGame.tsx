import { useEffect, useRef, useCallback, useState } from 'react'
import { useMultiplayerStore } from '../../store/multiplayerStore'
import CountdownOverlay from '../game/CountdownOverlay'
import OpponentProgress from './OpponentProgress'
import type { CharacterState } from '../../types'

interface MultiplayerGameProps {
  onGameEnd: () => void
}

export default function MultiplayerGame({ onGameEnd }: MultiplayerGameProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentWordRef = useRef<HTMLSpanElement>(null)
  const [localFinished, setLocalFinished] = useState(false)

  const words = useMultiplayerStore((state) => state.words)
  const currentWordIndex = useMultiplayerStore((state) => state.currentWordIndex)
  const currentCharIndex = useMultiplayerStore((state) => state.currentCharIndex)
  const typedCharacters = useMultiplayerStore((state) => state.typedCharacters)
  const roomStatus = useMultiplayerStore((state) => state.roomStatus)
  const startTime = useMultiplayerStore((state) => state.startTime)
  const errors = useMultiplayerStore((state) => state.errors)
  const totalKeystrokes = useMultiplayerStore((state) => state.totalKeystrokes)
  const opponentProgress = useMultiplayerStore((state) => state.opponentProgress)
  const handleKeyPress = useMultiplayerStore((state) => state.handleKeyPress)
  const finishGame = useMultiplayerStore((state) => state.finishGame)

  const isPlaying = roomStatus === 'playing'
  const isCountdown = roomStatus === 'countdown'

  const elapsed = startTime ? Date.now() - startTime : 0
  const minutes = elapsed / 60000
  const wpm = minutes > 0 ? Math.round(currentWordIndex / minutes) : 0
  const correctChars = typedCharacters.flat().filter(c => c === 'correct').length
  const totalChars = typedCharacters.flat().filter(c => c !== 'pending').length
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100
  const myProgress = Math.min(100, (currentWordIndex / words.length) * 100)

  useEffect(() => {
    if (currentWordRef.current && containerRef.current) {
      const container = containerRef.current
      const word = currentWordRef.current
      const containerRect = container.getBoundingClientRect()
      const wordRect = word.getBoundingClientRect()

      const wordTop = wordRect.top - containerRect.top + container.scrollTop
      const targetScroll = wordTop - containerRect.height / 3

      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      })
    }
  }, [currentWordIndex])

  const handleCountdownComplete = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isPlaying || localFinished) return

    if (e.key === 'Backspace' || e.key === ' ' || e.key.length === 1) {
      e.preventDefault()
      handleKeyPress(e.key)
    }
  }, [isPlaying, localFinished, handleKeyPress])

  useEffect(() => {
    if (isPlaying && currentWordIndex === words.length - 1) {
      const currentWord = words[currentWordIndex]
      const allCharsTyped = typedCharacters[currentWordIndex]?.every(c => c !== 'pending')
      
      if (allCharsTyped && currentCharIndex >= currentWord.length && !localFinished) {
        setLocalFinished(true)
        const elapsedMs = startTime ? Date.now() - startTime : 0
        finishGame({
          wordsTyped: currentWordIndex + 1,
          totalWords: words.length,
          errors,
          wpm,
          accuracy,
          elapsedMs,
        })
      }
    }
  }, [currentWordIndex, currentCharIndex, typedCharacters, words, isPlaying, localFinished, startTime, errors, wpm, accuracy, finishGame])

  useEffect(() => {
    if (roomStatus === 'finished') {
      onGameEnd()
    }
  }, [roomStatus, onGameEnd])

  const getCharacterClass = (charState: CharacterState, isCurrentChar: boolean): string => {
    const base = 'relative transition-colors duration-75'
    
    if (isCurrentChar && isPlaying) {
      return `${base} text-white bg-[var(--color-amber-500)]/30`
    }

    switch (charState) {
      case 'correct':
        return `${base} text-green-400`
      case 'incorrect':
        return `${base} text-red-400 underline decoration-red-500`
      default:
        return `${base} text-[var(--color-gray-500)]`
    }
  }

  const getWordClass = (wordIndex: number): string => {
    const base = 'inline-block mr-3 mb-2'
    
    if (wordIndex === currentWordIndex && isPlaying) {
      return `${base} bg-[var(--color-charcoal-700)]/50 rounded px-1 -mx-1`
    }
    
    if (wordIndex < currentWordIndex) {
      const wordChars = typedCharacters[wordIndex]
      const hasErrors = wordChars?.some((char) => char === 'incorrect')
      if (hasErrors) {
        return `${base} opacity-60`
      }
    }
    
    return base
  }

  return (
    <div className="space-y-4">
      <OpponentProgress progress={opponentProgress} totalWords={words.length} />

      <div className="flex items-center justify-between rounded-lg bg-[var(--color-charcoal-800)]/50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span className="font-semibold text-white">You</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-gray-400)]">
            <span className="font-[var(--font-mono)] text-[var(--color-amber-400)]">{wpm}</span> WPM
          </span>
          <span className="text-[var(--color-gray-400)]">
            <span className="font-[var(--font-mono)] text-white">{accuracy}%</span> accuracy
          </span>
          <span className="text-[var(--color-gray-400)]">
            <span className="font-[var(--font-mono)] text-white">{currentWordIndex}</span>/{words.length} words
          </span>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[var(--color-charcoal-700)]">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-amber-500)] to-[var(--color-amber-400)] transition-all duration-300"
          style={{ width: `${myProgress}%` }}
        />
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="relative h-48 overflow-hidden rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/50 p-6"
          onClick={() => inputRef.current?.focus()}
        >
          <div
            className="font-[var(--font-mono)] text-2xl leading-relaxed tracking-wide"
            style={{ lineHeight: '2.5rem' }}
          >
            {words.map((word, wordIndex) => (
              <span
                key={wordIndex}
                ref={wordIndex === currentWordIndex ? currentWordRef : null}
                className={getWordClass(wordIndex)}
              >
                {word.split('').map((char, charIndex) => {
                  const charState = typedCharacters[wordIndex]?.[charIndex] ?? 'pending'
                  const isCurrentChar = wordIndex === currentWordIndex && charIndex === currentCharIndex
                  
                  return (
                    <span
                      key={charIndex}
                      className={getCharacterClass(charState, isCurrentChar)}
                    >
                      {char}
                      {isCurrentChar && isPlaying && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full animate-pulse bg-[var(--color-amber-400)]" />
                      )}
                    </span>
                  )
                })}
              </span>
            ))}
          </div>
          
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-charcoal-800)] to-transparent" />
        </div>

        {isCountdown && (
          <CountdownOverlay onComplete={handleCountdownComplete} />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="sr-only"
        onKeyDown={onKeyDown}
        autoFocus={isPlaying}
        tabIndex={0}
      />

      {localFinished && roomStatus === 'playing' && (
        <div className="rounded-lg bg-green-500/10 p-4 text-center">
          <p className="text-green-400">You finished! Waiting for opponent...</p>
        </div>
      )}
    </div>
  )
}
