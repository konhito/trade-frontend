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
  const validateToken = useCallback(async (token: string, retryCount = 0): Promise<boolean> => {
    try {
      console.log('[useAuth] Validating token, length:', token?.length, 'retry:', retryCount)
      console.log('[useAuth] Token preview:', token ? `${token.substring(0, 20)}...` : 'null')
      
      const user = await apiFetch<AuthUser>('/api/auth/me', { token })
      console.log('[useAuth] ✅ Token validated successfully, user:', user)
      setState({ token, user })
      // Also store user info in localStorage for compatibility
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem('userId', String(user.id))
        localStorage.setItem('userEmail', user.email)
        localStorage.removeItem('oauth_token_fresh')
        localStorage.removeItem('oauth_token_timestamp')
      }
      return true
    } catch (err: any) {
      console.error('[useAuth] ❌ Token validation failed:', err)
      console.error('[useAuth] Error details:', {
        message: err?.message,
        status: err?.status,
        retryCount
      })
      
      // Check if this is a fresh OAuth token
      const isFreshToken = typeof window !== 'undefined' && 
        (window.location.search.includes('token=') || 
         localStorage.getItem('oauth_token_fresh') === 'true')
      
      const errorMessage = err?.message || ''
      const is401 = errorMessage.includes('401') || errorMessage.includes('Unauthorized') || err?.status === 401
      
      // If it's a fresh token and 401, retry up to 3 times with increasing delays
      if (isFreshToken && is401 && retryCount < 3) {
        const delay = (retryCount + 1) * 500 // 500ms, 1000ms, 1500ms
        console.warn(`[useAuth] ⚠️ Got 401 but token is fresh from OAuth - retrying in ${delay}ms (attempt ${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return validateToken(token, retryCount + 1)
      }
      
      // If it's a fresh token but we've exhausted retries, keep the token anyway
      // The dashboard will handle final validation
      if (isFreshToken) {
        console.warn('[useAuth] ⚠️ Keeping token despite validation failure - dashboard will retry')
        // Don't clear state - let dashboard handle it
        return false
      }
      
      // Clear invalid token only if it's definitely invalid (not fresh)
      if (typeof window !== 'undefined' && !isFreshToken) {
        console.warn('[useAuth] Clearing invalid token from localStorage')
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('oauth_token_fresh')
        localStorage.removeItem('oauth_token_timestamp')
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
    const handleTokenStored = async () => {
      if (!mounted) return
      console.log('[useAuth] 🔔 handleTokenStored event received')
      
      // Wait a tiny bit to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      console.log('[useAuth] Token check after event:', token ? `Found (length: ${token.length})` : 'NOT FOUND')
      
      if (token) {
        console.log('[useAuth] ✅ Token found, starting validation...')
        setLoading(true)
        try {
          const isValid = await validateToken(token)
          console.log('[useAuth] ✅ Token validation result:', isValid ? 'SUCCESS' : 'FAILED')
        } catch (err) {
          console.error('[useAuth] ❌ Error in handleTokenStored:', err)
        } finally {
          if (mounted) setLoading(false)
        }
      } else {
        console.warn('[useAuth] ⚠️ handleTokenStored called but no token found in localStorage')
        console.warn('[useAuth] localStorage keys:', typeof window !== 'undefined' ? Object.keys(localStorage) : [])
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
        console.log('[useAuth] 🔔 Storage change detected for token:', e.newValue ? 'SET' : 'REMOVED')
        if (e.newValue) {
          console.log('[useAuth] Validating token from storage change...')
          setLoading(true)
          validateToken(e.newValue).finally(() => {
            if (mounted) setLoading(false)
          })
        } else {
          setState({ token: null, user: null })
        }
      }
    }
    
    // Poll for token if it's in URL (for OAuth callback)
    const checkForUrlToken = () => {
      if (!mounted) return
      if (typeof window === 'undefined') return
      
      const urlParams = new URLSearchParams(window.location.search)
      const urlToken = urlParams.get('token')
      const storedToken = localStorage.getItem('token')
      
      // If token is in URL but not in localStorage, store it
      if (urlToken && !storedToken) {
        console.log('[useAuth] 🔍 Found token in URL, storing it...')
        localStorage.setItem('token', urlToken)
        setLoading(true)
        validateToken(urlToken).finally(() => {
          if (mounted) setLoading(false)
        })
      }
    }
    
    // Check immediately and then periodically for a short time
    checkForUrlToken()
    const urlTokenCheckInterval = setInterval(() => {
      checkForUrlToken()
    }, 100)
    
    // Stop checking after 3 seconds
    setTimeout(() => {
      clearInterval(urlTokenCheckInterval)
    }, 3000)

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
      const res = await apiFetch<{ token: string }>('/api/auth/login', {
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
      const user = await apiFetch<AuthUser>('/api/auth/me', { token: res.token })
      
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
      const res = await apiFetch<{ token: string }>('/api/auth/register', {
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
      const user = await apiFetch<AuthUser>('/api/auth/me', { token: res.token })
      
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
      localStorage.removeItem('deltalytix_user_data')
      // Dispatch logout event
      window.dispatchEvent(new Event('auth-logout'))
      // Redirect to login page after logout
      window.location.href = '/signin'
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
