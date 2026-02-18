import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-950)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link 
          to="/" 
          className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-white transition-colors hover:text-[var(--color-amber-400)]"
        >
          Pisalo
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/leaderboard"
            className="font-medium text-[var(--color-gray-400)] transition-colors hover:text-white"
          >
            Leaderboard
          </Link>

          <button
            type="button"
            className="rounded-lg border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)] px-4 py-2 font-medium text-white transition-all hover:border-[var(--color-amber-500)] hover:bg-[var(--color-charcoal-700)]"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  )
}
