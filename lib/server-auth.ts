// Server-side auth utilities for API routes
import { cookies } from 'next/headers'

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const userId = cookieStore.get("userId")?.value

  if (token && userId) {
    return userId
  }

  return null
}

export async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  const userEmail = cookieStore.get("userEmail")?.value
  const token = cookieStore.get("token")?.value

  if (token && userId) {
    return {
      id: userId,
      email: userEmail || undefined,
    }
  }

  return null
}

// Legacy compatibility - returns null (no Supabase client)
export function createClient() {
  return null
}
