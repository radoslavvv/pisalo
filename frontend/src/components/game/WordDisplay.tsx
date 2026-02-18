import { useRef, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { CharacterState } from '../../types'

export default function WordDisplay() {
  const words = useGameStore((state) => state.words)
  const currentWordIndex = useGameStore((state) => state.currentWordIndex)
  const currentCharIndex = useGameStore((state) => state.currentCharIndex)
  const typedCharacters = useGameStore((state) => state.typedCharacters)
  const status = useGameStore((state) => state.status)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentWordRef = useRef<HTMLSpanElement>(null)

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

  const getCharacterClass = (charState: CharacterState, isCurrentChar: boolean): string => {
    const base = 'relative transition-colors duration-75'
    
    if (isCurrentChar && status === 'playing') {
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
    
    if (wordIndex === currentWordIndex && status === 'playing') {
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

  if (words.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--color-gray-500)]">
        Loading words...
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-48 overflow-hidden rounded-xl border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/50 p-6"
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
                  {isCurrentChar && status === 'playing' && (
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
  )
}
