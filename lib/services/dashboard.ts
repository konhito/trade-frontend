import { apiFetch } from '@/lib/api'

export async function getDashboardStats(userId: string, period: number = 30, forceRefresh: boolean = true) {
  // Add cache-busting timestamp to always fetch fresh data
  const timestamp = forceRefresh ? `&_t=${Date.now()}` : ''
  return apiFetch<{ stats: any }>(`/dashboard/stats?userId=${encodeURIComponent(userId)}&period=${period}${timestamp}`)
}


