import { apiFetch } from '@/lib/api'

export async function listPayouts(params: { userId: string; accountNumber?: string }) {
  const qs = new URLSearchParams({ userId: params.userId })
  if (params.accountNumber) qs.set('accountNumber', params.accountNumber)
  return apiFetch<{ payouts: any[] }>(`/payouts?${qs.toString()}`)
}

export async function savePayout(body: { id?: string; userId: string; accountNumber: string; amount: number }) {
  return apiFetch<{ payout: any }>(`/payouts`, { method: 'POST', body })
}

export async function deletePayout(id: string) {
  return apiFetch<{ message: string }>(`/payouts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}


