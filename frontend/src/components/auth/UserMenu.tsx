import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  const handleLogout = async () => {
    setIsOpen(false)
    await authService.logout()
  }

  const getAvatarDisplay = () => {
    if (user.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.username}
          className="h-full w-full rounded-full object-cover"
        />
      )
    }

    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-amber-500)] text-sm font-bold text-[var(--color-charcoal-950)]">
        {user.username.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg border border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)] px-3 py-2 transition-all hover:border-[var(--color-amber-500)] hover:bg-[var(--color-charcoal-700)]"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full">
          {getAvatarDisplay()}
        </div>
        <span className="hidden font-medium text-white sm:inline">
          {user.username}
        </span>
        {user.isGuest && (
          <span className="hidden rounded bg-[var(--color-charcoal-700)] px-2 py-0.5 text-xs text-[var(--color-gray-400)] sm:inline">
            Guest
          </span>
        )}
        <svg
          className={`h-4 w-4 text-[var(--color-gray-400)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right animate-in fade-in zoom-in duration-100">
          <div className="rounded-lg border border-[var(--color-charcoal-700)] bg-[var(--color-charcoal-800)]/95 shadow-xl backdrop-blur-md">
            <div className="border-b border-[var(--color-charcoal-700)] p-4">
              <p className="font-medium text-white">{user.username}</p>
              {user.isGuest ? (
                <p className="text-sm text-[var(--color-gray-400)]">
                  Guest Account
                </p>
              ) : (
                <p className="text-sm text-[var(--color-gray-400)]">
                  Signed in with GitHub
                </p>
              )}
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-[var(--color-charcoal-700)]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
