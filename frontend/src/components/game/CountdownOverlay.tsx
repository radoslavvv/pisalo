import { useEffect, useState } from 'react'

interface CountdownOverlayProps {
  onComplete: () => void
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount(count - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--color-charcoal-900)]/95 backdrop-blur-sm">
      <div className="text-center">
        <div 
          key={count}
          className="animate-scale-in font-[var(--font-display)] text-8xl font-bold text-[var(--color-amber-400)]"
        >
          {count === 0 ? 'GO!' : count}
        </div>
        <p className="mt-4 text-[var(--color-gray-400)]">
          Get ready to type...
        </p>
      </div>
    </div>
  )
}
