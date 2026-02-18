import { Link } from 'react-router-dom'
import type { GameModeConfig } from '../../types'

interface GameModeCardProps {
  mode: GameModeConfig
  index: number
}

export default function GameModeCard({ mode, index }: GameModeCardProps) {
  const defaultOption = mode.options?.[1]?.value ?? mode.options?.[0]?.value ?? ''
  const linkPath = mode.id === 'multiplayer' 
    ? '/game/multiplayer' 
    : `/game/${mode.id}${defaultOption ? `?value=${defaultOption}` : ''}`

  return (
    <Link
      to={linkPath}
      className="animate-scale-in group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-900)] p-6 opacity-0 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-amber-500)]/50 hover:bg-[var(--color-charcoal-800)] hover:shadow-lg hover:shadow-[var(--color-amber-500)]/10"
      style={{ animationDelay: `${index * 100 + 200}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-amber-500)]/0 to-[var(--color-amber-500)]/0 transition-all duration-300 group-hover:from-[var(--color-amber-500)]/5 group-hover:to-transparent" />
      
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-4xl">{mode.icon}</span>
          <svg 
            className="h-5 w-5 -translate-x-2 text-[var(--color-gray-500)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[var(--color-amber-400)] group-hover:opacity-100" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <h3 className="mb-2 font-[var(--font-display)] text-xl font-semibold text-white transition-colors group-hover:text-[var(--color-amber-400)]">
          {mode.name}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-[var(--color-gray-400)]">
          {mode.description}
        </p>

        {mode.options && (
          <div className="flex flex-wrap gap-2">
            {mode.options.map((option) => (
              <span
                key={option.value}
                className="rounded-lg bg-[var(--color-charcoal-700)] px-3 py-1 font-[var(--font-mono)] text-xs text-[var(--color-gray-400)] transition-colors group-hover:bg-[var(--color-charcoal-600)] group-hover:text-white"
              >
                {option.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
