'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-provider'

/**
 * Prefetch dashboard data when user is authenticated
 * Used on landing page to prepare dashboard data in advance
 * 
 * INTEGRATED WITH SWR:
 * - Uses low priority to not block landing page (SWR pattern)
 * - Prefetches route and data API
 * - When user navigates, SWR will show prefetched data instantly
 */
export function useDashboardPrefetch() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated by trying to get session
    const checkAndPrefetch = async () => {
      try {
        // Check auth status without blocking
        const authResponse = await fetch('https://www.backend.mytradejournal.co.in/api/auth/me', {
          method: 'GET',
          // @ts-ignore - priority may not be in all browsers
          priority: 'low',
        }).catch(() => null)

        if (authResponse?.ok) {
          const data = await authResponse.json().catch(() => ({ user: null }))
          
          if (data?.user?.id) {
            const userId = data.user.id
            
            // Prefetch dashboard page route (Next.js router)
            router.prefetch('/dashboard')

            // SWR PATTERN: Prefetch data in background (low priority)
            // When user navigates, data will be cached and shown instantly
            const prefetchData = () => {
              // Prefetch dashboard data API endpoint
              fetch(`/api/dashboard/data?userId=${userId}`, {
                method: 'GET',
                // @ts-ignore
                priority: 'low',
                cache: 'force-cache',
              }).catch(() => {
                // Silently fail - this is just prefetching
              })
            }

            // Delay prefetch to not interfere with landing page load
            // Use requestIdleCallback for non-blocking prefetch
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              window.requestIdleCallback(() => {
                setTimeout(prefetchData, 1000)
              }, { timeout: 5000 })
            } else {
              setTimeout(prefetchData, 2000)
            }
          }
        }
      } catch (error) {
        // Silently fail - prefetching should not break the app
      }
    }

    // Delay check slightly to not interfere with landing page load
    const timeoutId = setTimeout(checkAndPrefetch, 500)

    return () => clearTimeout(timeoutId)
  }, [router])
}

/**
 * Prefetch related dashboard pages after initial dashboard load
 * This makes navigation to other pages instant
 */
export function useDashboardPagePrefetch(enabled: boolean = true) {
  const router = useRouter()
  const { isAuthenticated, session } = useAuth()

  useEffect(() => {
    if (!enabled || !isAuthenticated || !session?.user?.id) return

    // Prefetch common dashboard pages after initial load
    const prefetchPages = async () => {
      // Wait a bit to not interfere with initial dashboard load
      await new Promise(resolve => setTimeout(resolve, 2000))

      const userId = session.user.id

      // Prefetch routes
      router.prefetch('/dashboard/strategies')
      router.prefetch('/dashboard/trades')
      router.prefetch('/dashboard/calendar')

      // Prefetch API endpoints for these pages
      // Use requestIdleCallback to not interfere with user interaction
      const prefetchAPIs = () => {
        Promise.all([
          fetch(`/api/strategies?userId=${userId}`, { 
            // @ts-ignore
            priority: 'low',
            cache: 'force-cache',
          }).catch(() => {}),
          fetch(`/api/trades?userId=${userId}`, { 
            // @ts-ignore
            priority: 'low',
            cache: 'force-cache',
          }).catch(() => {}),
          // Calendar uses trade data, so trades API covers it
        ]).catch(() => {
          // Silently fail
        })
      }

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(prefetchAPIs, { timeout: 5000 })
      } else {
        setTimeout(prefetchAPIs, 500)
      }
    }

    prefetchPages()
  }, [enabled, isAuthenticated, session?.user?.id, router])
}

