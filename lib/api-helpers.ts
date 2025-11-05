/**
 * Server-side API helpers for fetching data from backend
 * These functions are designed to be used in Next.js API routes (server-side only)
 */

import { backendBaseUrl } from './api'

/**
 * Get authentication token from Next.js cookies (server-side only)
 * This is the primary method for getting tokens in API routes
 */
export async function getAuthTokenFromCookies(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    console.warn('[getAuthTokenFromCookies] Called in client-side context - returning null')
    return null
  }
  
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return cookieStore.get('auth_token')?.value || null
  } catch (error) {
    console.error('[getAuthTokenFromCookies] Error getting token from cookies:', error)
    return null
  }
}

/**
 * Get user ID from Next.js cookies (server-side only)
 */
export async function getUserIdFromCookies(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    console.warn('[getUserIdFromCookies] Called in client-side context - returning null')
    return null
  }
  
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return cookieStore.get('user_id')?.value || null
  } catch (error) {
    console.error('[getUserIdFromCookies] Error getting user ID from cookies:', error)
    return null
  }
}

/**
 * Get authenticated user from backend API using cookies
 */
export async function getAuthenticatedUserFromBackend(): Promise<{ id: string | number; email?: string } | null> {
  const token = await getAuthTokenFromCookies()
  if (!token) return null
  
  try {
    const res = await fetch(`${backendBaseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('[getAuthenticatedUserFromBackend] Error fetching user from backend:', error)
    return null
  }
}

/**
 * Fetch trades from backend API (server-side only)
 * Gets userId and token from cookies automatically
 */
export async function fetchTradesFromBackend(): Promise<any[]> {
  // Get user ID from cookies first (faster)
  const userId = await getUserIdFromCookies()
  const token = await getAuthTokenFromCookies()
  
  if (!userId || !token) {
    // Fallback: try to get user from backend
    const user = await getAuthenticatedUserFromBackend()
    if (!user || !user.id) {
      console.warn('[fetchTradesFromBackend] No user ID or token available')
      return []
    }
    
    // Use user.id and token for fetching
    const effectiveUserId = user.id
    const effectiveToken = token || await getAuthTokenFromCookies()
    
    if (!effectiveToken) {
      console.warn('[fetchTradesFromBackend] No auth token available')
      return []
    }
    
    try {
      const qs = new URLSearchParams({ userId: String(effectiveUserId) })
      const res = await fetch(`${backendBaseUrl}/trades?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })
      
      if (!res.ok) {
        console.error(`[fetchTradesFromBackend] API error: ${res.status} ${res.statusText}`)
        return []
      }
      
      const data = await res.json()
      return data.trades || []
    } catch (error) {
      console.error('[fetchTradesFromBackend] Error fetching trades:', error)
      return []
    }
  }
  
  // Use userId and token from cookies
  try {
    const qs = new URLSearchParams({ userId: String(userId) })
    const res = await fetch(`${backendBaseUrl}/trades?${qs.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
    
    if (!res.ok) {
      console.error(`[fetchTradesFromBackend] API error: ${res.status} ${res.statusText}`)
      return []
    }
    
    const data = await res.json()
    return data.trades || []
  } catch (error) {
    console.error('[fetchTradesFromBackend] Error fetching trades:', error)
    return []
  }
}

