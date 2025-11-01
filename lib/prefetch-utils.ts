/**
 * Prefetch utilities for optimizing dashboard navigation
 */

import { backendBaseUrl } from '@/lib/api'

/**
 * Prefetch dashboard data API endpoint
 * This warms up the cache and makes subsequent requests faster
 */
export async function prefetchDashboardData(userId: string): Promise<void> {
  try {
    // Use link prefetching or fetch with low priority
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      // Use idle callback to not interfere with current page
      window.requestIdleCallback(() => {
        fetch(`${backendBaseUrl}/dashboard/stats?userId=${userId}&period=30&_t=${Date.now()}`, {
          method: 'GET',
          // @ts-ignore - priority may not be in all browsers
          priority: 'low',
          cache: 'no-store',
        }).catch(() => {
          // Silently fail - this is just prefetching
        })
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        fetch(`${backendBaseUrl}/dashboard/stats?userId=${userId}&period=30&_t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
        }).catch(() => {})
      }, 1000)
    }
  } catch (error) {
    // Silently fail - prefetching should not break the app
  }
}

/**
 * Prefetch multiple dashboard page APIs
 */
export async function prefetchDashboardPages(userId: string, pages: string[]): Promise<void> {
  try {
    const endpoints = pages.map(page => {
      switch (page) {
        case 'strategies':
          return `${backendBaseUrl}/strategies?userId=${userId}`
        case 'trades':
          return `${backendBaseUrl}/trades?userId=${userId}`
        case 'calendar':
          // Calendar uses trades data
          return `${backendBaseUrl}/trades?userId=${userId}`
        default:
          return null
      }
    }).filter(Boolean) as string[]

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        Promise.all(
          endpoints.map(endpoint =>
            fetch(endpoint, {
              method: 'GET',
              // @ts-ignore
              priority: 'low',
              cache: 'force-cache',
            }).catch(() => {})
          )
        ).catch(() => {})
      })
    } else {
      setTimeout(() => {
        Promise.all(
          endpoints.map(endpoint =>
            fetch(endpoint, {
              method: 'GET',
              cache: 'force-cache',
            }).catch(() => {})
          )
        ).catch(() => {})
      }, 1000)
    }
  } catch (error) {
    // Silently fail
  }
}


