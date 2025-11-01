import { apiFetch } from '@/lib/api'

// Get token from localStorage for client-side calls
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem('token') || undefined
}

export async function listTrades(params: { userId: string; from?: string; status?: string; strategy?: string; forceRefresh?: boolean }) {
  const qs = new URLSearchParams({ userId: params.userId })
  if (params.from) qs.set('from', params.from)
  if (params.status) qs.set('status', params.status)
  if (params.strategy) qs.set('strategy', params.strategy)
  // Only add cache-busting timestamp when forceRefresh is true
  // This prevents excessive API calls while still allowing forced refreshes
  if (params.forceRefresh) {
    qs.set('_t', Date.now().toString())
  }
  const token = getAuthToken()
  console.log('[listTrades] Calling API with params:', qs.toString())
  const result = await apiFetch<{ trades: any[] }>(`/trades?${qs.toString()}`, { token })
  console.log('[listTrades] API result:', result)
  return result
}

export async function getTrade(id: string) {
  const token = getAuthToken()
  return apiFetch<{ trade: any }>(`/trades/${encodeURIComponent(id)}`, { token })
}

export async function createTrade(body: { userId: string; symbol: string; status: string; direction?: string; pnl?: number; pnlPercent?: number; strategy?: string; entryDate?: string }) {
  const token = getAuthToken()
  return apiFetch<{ trade: any }>(`/trades`, { method: 'POST', body, token })
}

export async function updateTrade(body: { id: string } & Record<string, any>) {
  const token = getAuthToken()
  return apiFetch<{ trade: any }>(`/trades`, { method: 'PUT', body, token })
}

export async function deleteTrade(id: string) {
  const token = getAuthToken()
  return apiFetch<{ message: string }>(`/trades?id=${encodeURIComponent(id)}`, { method: 'DELETE', token })
}


