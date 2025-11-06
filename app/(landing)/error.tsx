'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error for debugging
    console.error('[LandingPage Error Boundary]', error)
    
    // If this is during OAuth token processing, try to recover
    // Check if there's a token in localStorage - if so, redirect to dashboard
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      console.log('[LandingPage Error Boundary] Token found, attempting recovery redirect...')
      // Wait a moment then redirect
      setTimeout(() => {
        try {
          router.replace('/dashboard')
        } catch (routerError) {
          console.error('[LandingPage Error Boundary] Router error, using window.location:', routerError)
          window.location.href = '/dashboard'
        }
      }, 100)
      return
    }
  }, [error, router])

  // Don't show error UI if we're redirecting
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4 max-w-md text-center p-6">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => {
            reset()
            router.refresh()
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

