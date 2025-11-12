import { apiFetch } from '@/lib/api'

// Get token from localStorage for client-side calls
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem('token') || undefined
}

// Client-side cache for strategies (survives page navigation)
const CACHE_KEY_PREFIX = 'strategies_cache_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes (backend cache is 2 days, but we refresh more often for UX)

interface CachedStrategies {
  data: { strategies: any[] }
  timestamp: number
  userId: string
  category?: string
  search?: string
}

function getCacheKey(userId: string, category?: string, search?: string): string {
  return `${CACHE_KEY_PREFIX}${userId}_${category || 'all'}_${search || ''}`
}

function getCachedStrategies(userId: string, category?: string, search?: string): { strategies: any[] } | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cacheKey = getCacheKey(userId, category, search)
    const cached = sessionStorage.getItem(cacheKey)
    if (!cached) return null
    
    const parsed: CachedStrategies = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is valid (not expired and same user)
    if (parsed.userId === userId && (now - parsed.timestamp) < CACHE_DURATION) {
      // Also check if filters match
      if (parsed.category === (category || undefined) && parsed.search === (search || undefined)) {
        console.log('[Strategies] Using cached data (age:', Math.round((now - parsed.timestamp) / 1000), 's)')
        return parsed.data
      }
    }
    
    // Cache expired or filters don't match, remove it
    sessionStorage.removeItem(cacheKey)
    return null
  } catch (err) {
    console.error('[Strategies] Error reading cache:', err)
    return null
  }
}

function setCachedStrategies(userId: string, data: { strategies: any[] }, category?: string, search?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheKey = getCacheKey(userId, category, search)
    const cached: CachedStrategies = {
      data,
      timestamp: Date.now(),
      userId,
      category: category || undefined,
      search: search || undefined
    }
    sessionStorage.setItem(cacheKey, JSON.stringify(cached))
    console.log('[Strategies] Cached data for', cacheKey)
  } catch (err) {
    console.error('[Strategies] Error writing cache:', err)
    // If storage is full, try to clear old caches
    try {
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX))
      keys.forEach(k => sessionStorage.removeItem(k))
    } catch {}
  }
}

export function clearStrategiesCache(userId?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    if (userId) {
      // Clear cache for specific user
      const keys = Object.keys(sessionStorage).filter(k => 
        k.startsWith(CACHE_KEY_PREFIX) && k.includes(userId)
      )
      keys.forEach(k => sessionStorage.removeItem(k))
    } else {
      // Clear all strategy caches
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX))
      keys.forEach(k => sessionStorage.removeItem(k))
    }
    console.log('[Strategies] Cleared cache for', userId || 'all users')
  } catch (err) {
    console.error('[Strategies] Error clearing cache:', err)
  }
}

export async function listStrategies(params: { userId: string; category?: string; search?: string; forceRefresh?: boolean }) {
  const { userId, category, search, forceRefresh = false } = params
  
  // Check cache first (unless force refresh is requested)
  if (!forceRefresh) {
    const cached = getCachedStrategies(userId, category, search)
    if (cached) {
      return cached
    }
  }
  
  // Fetch from API (backend has Redis cache, so this is still fast)
  const qs = new URLSearchParams({ userId })
  if (category) qs.set('category', category)
  if (search) qs.set('search', search)
  // Removed cache-busting timestamp - let backend Redis cache work + browser cache
  
  const token = getAuthToken()
  const result = await apiFetch<{ strategies: any[] }>(`/strategies?${qs.toString()}`, { token })
  
  // Cache the result for future use
  setCachedStrategies(userId, result, category, search)
  
  return result
}

export async function createStrategy(body: { userId: string; name: string; category: string; description?: string; rules?: any; parameters?: any; image?: string | null }) {
  const token = getAuthToken()
  console.log('[createStrategy API] Sending request with image:', body.image ? `Base64 string (${body.image.length} chars)` : 'null')
  const result = await apiFetch<{ strategy: any }>(`/strategies`, { method: 'POST', body, token })
  console.log('[createStrategy API] Response received, image in response:', result.strategy?.image ? `Base64 string (${result.strategy.image.length} chars)` : 'null')
  
  // Clear cache after creating strategy (data has changed)
  clearStrategiesCache(body.userId)
  
  return result
}

export async function updateStrategy(body: { id: string } & Record<string, any>) {
  // Get token - try multiple times to ensure we get it
  let token = getAuthToken()
  
  // If token not found, wait a bit and try again (in case localStorage hasn't loaded yet)
  if (!token && typeof window !== 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100))
    token = getAuthToken()
  }
  
  console.log('[updateStrategy] Token check:', {
    exists: !!token,
    length: token?.length || 0,
    firstChars: token ? token.substring(0, 10) + '...' : 'none',
    body: { id: body.id, hasHistoricalData: !!body.historicalData }
  })
  
  if (!token) {
    console.error('[updateStrategy] No token found in localStorage. Available keys:', 
      typeof window !== 'undefined' ? Object.keys(localStorage) : 'N/A (SSR)')
    throw new Error('Authentication required. Please sign in and try again.')
  }
  
  const result = await apiFetch<{ strategy: any }>(`/strategies`, { method: 'PUT', body, token })
  
  // Clear cache after updating strategy (data has changed)
  // We don't have userId in body, so clear all caches (safe since backend invalidates Redis cache)
  clearStrategiesCache()
  
  return result
}

export async function getStrategy(id: string) {
  const token = getAuthToken()
  return apiFetch<{ strategy: any }>(`/strategies/${id}`, { token })
}

export async function deleteStrategy(id: string) {
  const token = getAuthToken()
  const result = await apiFetch<{ message: string }>(`/strategies?id=${encodeURIComponent(id)}`, { method: 'DELETE', token })
  
  // Clear cache after deleting strategy (data has changed)
  clearStrategiesCache()
  
  return result
}


