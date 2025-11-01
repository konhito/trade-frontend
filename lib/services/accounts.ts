import { apiFetch } from '@/lib/api'

export async function listAccounts(userId: string) {
  return apiFetch<{ accounts: any[] }>(`/accounts?userId=${encodeURIComponent(userId)}`)
}

export async function upsertAccount(body: { id?: string; userId: string; number: string; groupId?: string | null; isActive?: boolean }) {
  const method = body.id ? 'PUT' : 'POST'
  return apiFetch<{ account: any }>(`/accounts`, { method, body })
}

export async function deleteAccount(id: string) {
  return apiFetch<{ message: string }>(`/accounts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}


