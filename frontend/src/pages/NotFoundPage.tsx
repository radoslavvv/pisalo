import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 font-[var(--font-mono)] text-8xl font-bold text-[var(--color-charcoal-700)]">
            404
          </h1>
          <h2 className="mb-4 font-[var(--font-display)] text-2xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="mb-8 text-[var(--color-gray-400)]">
            Looks like you typed the wrong URL. Ironic, isn't it?
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-amber-500)] px-6 py-3 font-semibold text-[var(--color-charcoal-950)] transition-colors hover:bg-[var(--color-amber-400)]"
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
