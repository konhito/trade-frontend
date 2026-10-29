export type TrackerStrategy = {
  id: number
  name: string
  segment: string
  description: string
  capital: number
  subscribeUrl: string
  externalId: string
  active: boolean
  weekdays: number[]
}

export const trackerWeekdays = [
  { value: 1, short: 'M', name: 'Monday' },
  { value: 2, short: 'T', name: 'Tuesday' },
  { value: 3, short: 'W', name: 'Wednesday' },
  { value: 4, short: 'Th', name: 'Thursday' },
  { value: 5, short: 'F', name: 'Friday' },
  { value: 6, short: 'Sa', name: 'Saturday' },
  { value: 0, short: 'Su', name: 'Sunday' },
] as const

export type TrackerEntry = {
  id: number
  strategyId: number
  tradeDate: string
  pnl: number
  note: string
}

export type TrackerSettings = {
  title: string
  contactUrl: string
  logoUrl: string
}

export type TrackerData = {
  settings: TrackerSettings
  strategies: TrackerStrategy[]
  entries: TrackerEntry[]
}

const fallbackBackend = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : 'https://backend.mytradejournal.co.in'

export const trackerApiBase = (
  process.env.NEXT_PUBLIC_BACKEND_URL || fallbackBackend
).replace(/\/+$/, '')

let adminKey = ''
export function setTrackerAdminKey(key: string) { adminKey = key }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${trackerApiBase}/public-tracker${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.method ? { Authorization: `Bearer ${adminKey}` } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  })

  const result = await response.json().catch(() => ({})) as Record<string, any>
  if (!response.ok) {
    const detail = typeof result.error === 'string'
      ? result.error
      : Object.values(result.error?.fieldErrors ?? {}).flat().find((item): item is string => typeof item === 'string') || 'Request failed'
    throw new Error(detail)
  }
  return result as T
}

export const trackerApi = {
  load: () => request<TrackerData>(''),
  createStrategy: (body: Omit<TrackerStrategy, 'id'>) => request('/strategies', { method: 'POST', body: JSON.stringify(body) }),
  updateStrategy: (id: number, body: Omit<TrackerStrategy, 'id'>) => request(`/strategies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteStrategy: (id: number) => request(`/strategies/${id}`, { method: 'DELETE' }),
  createEntry: (body: Omit<TrackerEntry, 'id'>) => request('/entries', { method: 'POST', body: JSON.stringify(body) }),
  updateEntry: (id: number, body: Omit<TrackerEntry, 'id'>) => request(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEntry: (id: number) => request(`/entries/${id}`, { method: 'DELETE' }),
  updateSettings: (body: TrackerSettings) => request<{ settings: TrackerSettings }>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
}

export function formatMoney(value: number) {
  return `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}
