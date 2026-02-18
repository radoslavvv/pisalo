import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { mockLeaderboard } from '../mocks/leaderboard'

export default function LeaderboardPlaceholder() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 font-[var(--font-display)] text-4xl font-bold text-white">
              Leaderboard
            </h1>
            <p className="text-[var(--color-gray-400)]">
              Top typists from around the world
            </p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-500)]/30 bg-[var(--color-amber-500)]/10 px-4 py-2 text-sm text-[var(--color-amber-400)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-amber-400)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-amber-500)]" />
              </span>
              Preview — Full leaderboard coming soon
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-900)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-gray-400)]">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-gray-400)]">Player</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-gray-400)]">WPM</th>
                  <th className="hidden px-6 py-4 text-right text-sm font-semibold text-[var(--color-gray-400)] sm:table-cell">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((entry, index) => (
                  <tr 
                    key={entry.username}
                    className="border-b border-[var(--color-charcoal-800)] transition-colors last:border-0 hover:bg-[var(--color-charcoal-800)]"
                  >
                    <td className="px-6 py-4">
                      <span className={`font-[var(--font-mono)] font-bold ${
                        index === 0 ? 'text-[var(--color-amber-400)]' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-amber-700' : 'text-[var(--color-gray-500)]'
                      }`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{entry.username}</td>
                    <td className="px-6 py-4 text-right font-[var(--font-mono)] font-semibold text-white">
                      {entry.wpm}
                    </td>
                    <td className="hidden px-6 py-4 text-right font-[var(--font-mono)] text-[var(--color-gray-400)] sm:table-cell">
                      {entry.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[var(--color-gray-400)] transition-colors hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
