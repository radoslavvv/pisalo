import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import GameContainer from '../components/game/GameContainer'
import { gameModes } from '../mocks/gameModes'
import type { GameMode } from '../types'

export default function GamePage() {
  const { mode } = useParams<{ mode: string }>()
  const [searchParams] = useSearchParams()
  
  const modeConfig = gameModes.find((m) => m.id === mode)
  
  if (!modeConfig) {
    return <Navigate to="/" replace />
  }

  const optionParam = searchParams.get('option')
  const option = optionParam ? parseInt(optionParam, 10) : undefined
  
  const validOption = modeConfig.options?.find(opt => opt.value === option)
  const defaultOption = modeConfig.options?.[0]?.value as number | undefined
  const selectedOption = validOption ? option : defaultOption

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                  <span className="text-2xl">{modeConfig.icon}</span>
                  <h1 className="font-[var(--font-display)] text-2xl font-bold text-white">
                    {modeConfig.name}
                  </h1>
                </div>
                <p className="mt-1 text-sm text-[var(--color-gray-500)]">
                  {modeConfig.description}
                </p>
              </div>
            </div>
            
            {modeConfig.options && modeConfig.options.length > 0 && (
              <div className="flex gap-2">
                {modeConfig.options.map((opt) => (
                  <Link
                    key={String(opt.value)}
                    to={`/game/${mode}?option=${opt.value}`}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      selectedOption === opt.value
                        ? 'border-[var(--color-amber-500)] bg-[var(--color-amber-500)]/10 text-[var(--color-amber-400)]'
                        : 'border-[var(--color-charcoal-600)] text-[var(--color-gray-400)] hover:border-[var(--color-gray-500)] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <GameContainer 
            mode={modeConfig.id as GameMode} 
            option={selectedOption} 
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
