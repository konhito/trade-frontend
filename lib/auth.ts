// Simplified auth module - removed Supabase dependency
// Authentication is now handled by backend API
'use client'

import { apiFetch } from '@/lib/api'

export function getWebsiteURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

// Simple auth client - checks localStorage for JWT token
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")
  return (token && userId) ? userId : null
}

// Get user from localStorage
export function getUser() {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")
  const userEmail = localStorage.getItem("userEmail")

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

// Backend auth functions - hardcoded for closed repo
const BACKEND_URL = 'https://backend.mytradejournal.co.in'

// Sign out - clear localStorage and redirect
export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('deltalytix_user_data')
    // Use window.location for client-side redirect
    window.location.href = '/signin'
  }
}

// Simple login with email/password
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let errorMessage = 'Login failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Invalid email or password. Please try again.'
        } else if (response.status === 404) {
          errorMessage = 'Authentication endpoint not found. Please check backend configuration.'
        } else {
          errorMessage = `Login failed with status ${response.status}`
        }
      }
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      throw error
    }

    const data = await response.json()

    // Get user info from /api/auth/me
    let userId = ''
    let userEmail = email
    if (data.token) {
      try {
        const meResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` },
        })
        if (meResponse.ok) {
          const userData = await meResponse.json()
          userId = userData.id
          userEmail = userData.email || email
        }
      } catch (e) {
        console.warn('Could not fetch user info:', e)
      }
    }

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
      if (userId) localStorage.setItem('userId', userId)
      localStorage.setItem('userEmail', userEmail)
    }

    return { success: true, token: data.token }
  } catch (error: any) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error?.message || 'An unexpected error occurred during login')
  }
}

// Register new user
export async function register(email: string, password: string, name?: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      let errorMessage = 'Registration failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        if (response.status === 409) {
          errorMessage = 'An account with this email already exists.'
        } else if (response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your input.'
        } else if (response.status === 404) {
          errorMessage = 'Registration endpoint not found. Please check backend configuration.'
        } else {
          errorMessage = `Registration failed with status ${response.status}`
        }
      }
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      throw error
    }

    const data = await response.json()

    // Get user info
    let userId = ''
    let userEmail = email
    if (data.token) {
      try {
        const meResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` },
        })
        if (meResponse.ok) {
          const userData = await meResponse.json()
          userId = userData.id
          userEmail = userData.email || email
        }
      } catch (e) {
        console.warn('Could not fetch user info:', e)
      }
    }

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
      if (userId) localStorage.setItem('userId', userId)
      localStorage.setItem('userEmail', userEmail)
    }

    return { success: true, token: data.token }
  } catch (error: any) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error?.message || 'An unexpected error occurred during registration')
  }
}

// OAuth functions
export function signInWithDiscord(next?: string | null) {
  // Discord sign-in removed
  console.log('Discord sign-in has been removed')
  if (typeof window !== 'undefined') {
    window.location.href = '/authentication?error=discord_removed'
  }
}

export function signInWithGoogle(next?: string | null) {
  if (typeof window === 'undefined') return
  
  const apiUrl = 'https://backend.mytradejournal.co.in'
  const nextUrl = next || '/dashboard'
  const redirectUrl = `${apiUrl}/api/auth/google?next=${encodeURIComponent(nextUrl)}`
  
  // Redirect to backend OAuth endpoint
  window.location.href = redirectUrl
}

