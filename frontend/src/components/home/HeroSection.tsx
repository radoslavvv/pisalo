import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const phrases = [
  'Test Your Typing Speed',
  'Master the Keyboard',
  'Type Like a Pro',
  'Break Your Records'
]

export default function HeroSection() {
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const phrase = phrases[currentPhrase]
    
    if (isTyping) {
      if (displayText.length < phrase.length) {
        const timeout = setTimeout(() => {
          setDisplayText(phrase.slice(0, displayText.length + 1))
        }, 80)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, 40)
        return () => clearTimeout(timeout)
      } else {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length)
        setIsTyping(true)
      }
    }
  }, [displayText, isTyping, currentPhrase])

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-charcoal-800)_0%,transparent_70%)]" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="mb-6 font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          <span className="inline-block min-h-[1.2em]">
            {displayText}
            <span className="ml-1 inline-block h-[1em] w-[3px] animate-pulse bg-[var(--color-amber-400)]" />
          </span>
        </h1>

        <p className="animate-fade-in-up stagger-1 mx-auto mb-10 max-w-2xl text-lg text-[var(--color-gray-400)] opacity-0 sm:text-xl">
          Challenge yourself with multiple game modes, compete on leaderboards, 
          and race against friends in real-time multiplayer battles.
        </p>

        <div className="animate-fade-in-up stagger-2 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row">
          <Link
            to="/game/timed?duration=30"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[var(--color-amber-500)] px-8 py-4 font-semibold text-[var(--color-charcoal-950)] transition-all hover:bg-[var(--color-amber-400)]"
          >
            <span className="relative z-10">Quick Start — 30s Race</span>
            <div className="absolute inset-0 -translate-x-full bg-[var(--color-amber-400)] transition-transform group-hover:translate-x-0" />
          </Link>

          <a
            href="#game-modes"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-charcoal-600)] px-8 py-4 font-semibold text-white transition-all hover:border-[var(--color-gray-500)] hover:bg-[var(--color-charcoal-800)]"
          >
            Choose Mode
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        <div className="animate-fade-in stagger-3 mt-16 flex items-center justify-center gap-8 text-sm text-[var(--color-gray-500)] opacity-0">
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-mono)] text-2xl font-bold text-white">1,247</span>
            <span>games today</span>
          </div>
          <div className="h-8 w-px bg-[var(--color-charcoal-700)]" />
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-mono)] text-2xl font-bold text-[var(--color-amber-400)]">156</span>
            <span>top WPM</span>
          </div>
        </div>
      </div>
    </section>
  )
}
