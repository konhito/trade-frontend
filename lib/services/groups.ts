import { apiFetch } from '@/lib/api'

export async function listGroups(userId: string) {
  return apiFetch<{ groups: any[] }>(`/groups?userId=${encodeURIComponent(userId)}`)
}

export async function createGroup(body: { userId: string; name: string }) {
  return apiFetch<{ group: any }>(`/groups`, { method: 'POST', body })
}

export async function renameGroup(body: { id: string; userId: string; name: string }) {
  return apiFetch<{ group: any }>(`/groups`, { method: 'PUT', body })
}

export async function deleteGroup(id: string) {
  return apiFetch<{ message: string }>(`/groups?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}


