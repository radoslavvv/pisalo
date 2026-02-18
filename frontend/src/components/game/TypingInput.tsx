import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useGameStore } from '../../store/gameStore'

export interface TypingInputHandle {
  focus: () => void
}

const TypingInput = forwardRef<TypingInputHandle>(function TypingInput(_, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const status = useGameStore((state) => state.status)
  const currentWordIndex = useGameStore((state) => state.currentWordIndex)
  const currentCharIndex = useGameStore((state) => state.currentCharIndex)
  const words = useGameStore((state) => state.words)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  useEffect(() => {
    if (status === 'playing') {
      inputRef.current?.focus()
    }
  }, [status])

  const currentWord = words[currentWordIndex] ?? ''
  const typedPortion = currentWord.slice(0, currentCharIndex)

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={typedPortion}
        onChange={() => {}}
        className="absolute h-0 w-0 opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
      />
      
      {status === 'playing' && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-[var(--color-gray-500)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Start typing...
          </span>
        </div>
      )}
      
      {status === 'idle' && (
        <div className="mt-4 text-center">
          <span className="text-sm text-[var(--color-gray-500)]">
            Press any key or click Start to begin
          </span>
        </div>
      )}
    </div>
  )
})

export default TypingInput
