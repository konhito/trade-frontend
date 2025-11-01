'use client'

import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface AuthUser {
  id: number
  email: string
  name?: string | null
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ token: null, user: null })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setLoading(false)
      return
    }
    apiFetch<AuthUser>('/auth/me', { token })
      .then((user) => setState({ token, user }))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    const res = await apiFetch<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    localStorage.setItem('token', res.token)
    const user = await apiFetch<AuthUser>('/auth/me', { token: res.token })
    setState({ token: res.token, user })
    return user
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setError(null)
    const res = await apiFetch<{ token: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    })
    localStorage.setItem('token', res.token)
    const user = await apiFetch<AuthUser>('/auth/me', { token: res.token })
    setState({ token: res.token, user })
    return user
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem('token')
    setState({ token: null, user: null })
  }, [])

  return { ...state, loading, error, login, register, logout }
}
