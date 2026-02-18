import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { gameModes } from '../mocks/gameModes'

export default function GamePlaceholder() {
  const { mode } = useParams<{ mode: string }>()
  const modeConfig = gameModes.find((m) => m.id === mode)

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 text-6xl">
            {modeConfig?.icon ?? '🎮'}
          </div>
          <h1 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white">
            {modeConfig?.name ?? 'Game Mode'}
          </h1>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-500)]/30 bg-[var(--color-amber-500)]/10 px-4 py-2 text-sm text-[var(--color-amber-400)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-amber-400)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-amber-500)]" />
            </span>
            Coming Soon
          </div>
          <p className="mb-8 text-[var(--color-gray-400)]">
            The game interface is being built. Check back soon to start typing!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-charcoal-600)] px-6 py-3 font-semibold text-white transition-all hover:border-[var(--color-gray-500)] hover:bg-[var(--color-charcoal-800)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
