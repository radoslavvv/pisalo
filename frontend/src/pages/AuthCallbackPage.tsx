import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      if (!token) {
        setError('No authentication token received.')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      try {
        const user = await authService.getCurrentUser(token)
        useAuthStore.getState().setAuth(user, token)
        navigate('/')
      } catch (err) {
        console.error('Failed to fetch user:', err)
        setError('Failed to complete authentication.')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-charcoal-950)]">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-white">{error}</h2>
            <p className="text-[var(--color-gray-400)]">Redirecting to home...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-charcoal-600)] border-t-[var(--color-amber-400)]" />
            <h2 className="text-2xl font-bold text-white">Completing sign in...</h2>
            <p className="text-[var(--color-gray-400)]">Please wait</p>
          </div>
        )}
      </div>
    </div>
  )
}
