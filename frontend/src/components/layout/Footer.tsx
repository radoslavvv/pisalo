export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-900)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-[var(--font-mono)] text-sm text-[var(--color-gray-500)]">
            Built for typists who mean business
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--color-gray-500)]">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--color-amber-400)]"
            >
              GitHub
            </a>
            <span className="text-[var(--color-charcoal-600)]">•</span>
            <span>© 2026 Pisalo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
