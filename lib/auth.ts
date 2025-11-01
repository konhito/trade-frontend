// Simplified auth module - removed Supabase dependency
// Authentication is now handled by backend API
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { headers } from "next/headers"

export async function getWebsiteURL() {
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

// Simple auth client - checks cookies for JWT token
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  const userId = cookieStore.get("user_id")?.value
  
  if (token && userId) {
    return userId
  }
  
  // Fallback to headers (from middleware)
  const headersList = await headers()
  const headerUserId = headersList.get("x-user-id")
  
  return headerUserId || null
}

// Get user from cookies/headers
export async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  const userEmail = cookieStore.get("user_email")?.value
  const token = cookieStore.get("auth_token")?.value
  
  if (token && userId) {
    return {
      id: userId,
      email: userEmail || undefined,
    }
  }
  
  // Fallback to headers
  const headersList = await headers()
  const headerUserId = headersList.get("x-user-id")
  const headerUserEmail = headersList.get("x-user-email")
  
  if (headerUserId) {
    return {
      id: headerUserId,
      email: headerUserEmail || undefined,
    }
  }
  
  return null
}

// Ensure user is authenticated
export async function ensureAuthenticated() {
  const userId = await getUserId()
  if (!userId) {
    redirect('/login')
  }
  return userId
}

// Sign out - clear auth cookies
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  cookieStore.delete("user_id")
  cookieStore.delete("user_email")
  redirect('/login')
}

// Legacy compatibility - returns null (no Supabase client)
export async function createClient() {
  return null
}

// Backend auth functions
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://trade-backend-production-b0a3.up.railway.app'

// Removed OTP functions - using email/password login instead

export async function signInWithDiscord(next?: string | null) {
  // TODO: Implement Discord OAuth via backend
  console.log('signInWithDiscord called')
  redirect('/authentication?error=not_implemented')
}

export async function signInWithGoogle(next?: string | null) {
  // TODO: Implement Google OAuth via backend
  console.log('signInWithGoogle called')
  redirect('/authentication?error=not_implemented')
}

// Simple login with email/password
export async function login(email: string, password: string) {
  try {
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    let response: Response
    try {
      response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Connection timeout. Please check if the backend server is running.')
      }
      if (fetchError.code === 'ECONNREFUSED' || fetchError.code === 'ECONNRESET') {
        throw new Error(`Cannot connect to backend server at ${BACKEND_URL}. Please check your backend configuration.`)
      }
      throw new Error(`Failed to connect to backend: ${fetchError.message || 'Unknown error'}`)
    }
    
    if (!response.ok) {
      let errorMessage = 'Login failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status-based messages
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Invalid email or password. Please try again.'
        } else if (response.status === 404) {
          errorMessage = 'Authentication endpoint not found. Please check backend configuration.'
        } else {
          errorMessage = `Login failed with status ${response.status}`
        }
      }
      // Create error with proper message
      const error = new Error(errorMessage)
      // Add status code for better error handling
      ;(error as any).status = response.status
      throw error
    }
    
    const data = await response.json()
    // Backend returns { token } - need to get user info from /auth/me
    let userId = ''
    if (data.token) {
      // Decode token or call /auth/me to get user info
      try {
        const meController = new AbortController()
        const meTimeoutId = setTimeout(() => meController.abort(), 5000)
        const meResponse = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` },
          signal: meController.signal
        })
        clearTimeout(meTimeoutId)
        if (meResponse.ok) {
          const userData = await meResponse.json()
          userId = userData.id
        }
      } catch (e) {
        console.warn('Could not fetch user info:', e)
        // Continue without userId - we'll try to extract it from token if possible
      }
    }
    
    const cookieStore = await cookies()
    cookieStore.set('auth_token', data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 }) // 7 days
    if (userId) cookieStore.set('user_id', userId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    cookieStore.set('user_email', email, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    
    return { success: true, token: data.token }
  } catch (error: any) {
    // Re-throw with original message if it's already an Error
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error?.message || 'An unexpected error occurred during login')
  }
}

// Register new user
export async function register(email: string, password: string, name?: string) {
  try {
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    let response: Response
    try {
      response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Connection timeout. Please check if the backend server is running.')
      }
      if (fetchError.code === 'ECONNREFUSED' || fetchError.code === 'ECONNRESET') {
        throw new Error(`Cannot connect to backend server at ${BACKEND_URL}. Please check your backend configuration.`)
      }
      throw new Error(`Failed to connect to backend: ${fetchError.message || 'Unknown error'}`)
    }
    
    if (!response.ok) {
      let errorMessage = 'Registration failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status-based messages
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
      // Create error with proper message
      const error = new Error(errorMessage)
      // Add status code for better error handling
      ;(error as any).status = response.status
      throw error
    }
    
    const data = await response.json()
    // Backend returns { token } - need to get user info
    let userId = ''
    if (data.token) {
      try {
        const meController = new AbortController()
        const meTimeoutId = setTimeout(() => meController.abort(), 5000)
        const meResponse = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` },
          signal: meController.signal
        })
        clearTimeout(meTimeoutId)
        if (meResponse.ok) {
          const userData = await meResponse.json()
          userId = userData.id
        }
      } catch (e) {
        console.warn('Could not fetch user info:', e)
        // Continue without userId
      }
    }
    
    const cookieStore = await cookies()
    cookieStore.set('auth_token', data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    if (userId) cookieStore.set('user_id', userId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    cookieStore.set('user_email', email, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    
    return { success: true, token: data.token }
  } catch (error: any) {
    // Re-throw with original message if it's already an Error
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error?.message || 'An unexpected error occurred during registration')
  }
}

