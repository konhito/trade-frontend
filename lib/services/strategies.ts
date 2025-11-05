import { apiFetch } from '@/lib/api'

// Get token from localStorage for client-side calls
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem('token') || undefined
}

export async function listStrategies(params: { userId: string; category?: string; search?: string }) {
  const qs = new URLSearchParams({ userId: params.userId })
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  // Add cache-busting timestamp to ensure fresh data
  qs.set('_t', Date.now().toString())
  const token = getAuthToken()
  return apiFetch<{ strategies: any[] }>(`/strategies?${qs.toString()}`, { token })
}

export async function createStrategy(body: { userId: string; name: string; category: string; description?: string; rules?: any; parameters?: any; image?: string | null }) {
  const token = getAuthToken()
  console.log('[createStrategy API] Sending request with image:', body.image ? `Base64 string (${body.image.length} chars)` : 'null')
  const result = await apiFetch<{ strategy: any }>(`/strategies`, { method: 'POST', body, token })
  console.log('[createStrategy API] Response received, image in response:', result.strategy?.image ? `Base64 string (${result.strategy.image.length} chars)` : 'null')
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
  
  return apiFetch<{ strategy: any }>(`/strategies`, { method: 'PUT', body, token })
}

export async function deleteStrategy(id: string) {
  const token = getAuthToken()
  return apiFetch<{ message: string }>(`/strategies?id=${encodeURIComponent(id)}`, { method: 'DELETE', token })
}


