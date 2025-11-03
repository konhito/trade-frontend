'use client'

import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface AuthUser {
  id: number
  email: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  createdAt?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ token: null, user: null })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Validate token and fetch user
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const user = await apiFetch<AuthUser>('/auth/me', { token })
      setState({ token, user })
      return true
    } catch (err) {
      console.warn('[useAuth] Token validation failed:', err)
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
      }
      setState({ token: null, user: null })
      return false
    }
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
          if (mounted) setLoading(false)
          return
        }
        
        // Validate the token
        await validateToken(token)
      } catch (err) {
        console.error('[useAuth] Initialization error:', err)
        if (mounted) setError('Failed to initialize authentication')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth events (token updates from other tabs/components)
    const handleTokenStored = () => {
      if (!mounted) return
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        validateToken(token)
      }
    }

    const handleProfileUpdated = () => {
      if (!mounted) return
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        validateToken(token) // This will refresh user data
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (!mounted) return
      if (e.key === 'token') {
        if (e.newValue) {
          validateToken(e.newValue)
        } else {
          setState({ token: null, user: null })
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-stored', handleTokenStored)
      window.addEventListener('auth-profile-updated', handleProfileUpdated)
      window.addEventListener('storage', handleStorageChange)
    }

    return () => {
      mounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-token-stored', handleTokenStored)
        window.removeEventListener('auth-profile-updated', handleProfileUpdated)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [validateToken])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      
      if (!res.token) {
        throw new Error('No token received from server')
      }

      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.token)
      }

      // Fetch user info
      const user = await apiFetch<AuthUser>('/auth/me', { token: res.token })
      
      // Store user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', String(user.id))
        localStorage.setItem('userEmail', user.email)
      }

      setState({ token: res.token, user })
      
      // Dispatch event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-token-stored'))
      }

      return user
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch<{ token: string }>('/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })
      
      if (!res.token) {
        throw new Error('No token received from server')
      }

      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.token)
      }

      // Fetch user info
      const user = await apiFetch<AuthUser>('/auth/me', { token: res.token })
      
      // Store user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', String(user.id))
        localStorage.setItem('userEmail', user.email)
      }

      setState({ token: res.token, user })
      
      // Dispatch event for other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-token-stored'))
      }

      return user
    } catch (err: any) {
      const errorMessage = err?.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      // Dispatch logout event
      window.dispatchEvent(new Event('auth-logout'))
    }
    setState({ token: null, user: null })
    setError(null)
  }, [])

  // Check if user is authenticated
  const isAuthenticated = state.user !== null && state.token !== null

  return { 
    ...state, 
    loading, 
    error, 
    login, 
    register, 
    logout,
    isAuthenticated,
    validateToken
  }
}
