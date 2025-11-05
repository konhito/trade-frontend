// Hardcoded backend URL (closed repo - no need for env vars)
export const backendBaseUrl = 'https://trade-backend-production-b0a3.up.railway.app'

// Force log on module load to verify it's being used
if (typeof window !== 'undefined') {
  console.log('🔧 [api.ts] MODULE LOADED - Backend URL is:', backendBaseUrl)
  console.log('🔧 [api.ts] Type:', typeof backendBaseUrl)
  console.log('🔧 [api.ts] Length:', backendBaseUrl?.length)
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Get auth token from localStorage or cookies
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  // Try localStorage first (client-side auth)
  const token = localStorage.getItem('token')
  if (token) {
    console.log('[getAuthToken] Found token in localStorage, length:', token.length)
    return token
  }
  // Log what keys are available for debugging
  console.warn('[getAuthToken] No token found. localStorage keys:', Object.keys(localStorage))
  // Fallback: try to get from cookies (this won't work in client-side JS, but keep for completeness)
  return undefined
}

export async function apiFetch<T>(path: string, options: {
  method?: HttpMethod
  token?: string
  body?: unknown
  headers?: Record<string, string>
} = {}): Promise<T> {
  const { method = 'GET', token: providedToken, body, headers } = options
  // Use provided token or try to get from localStorage
  const token = providedToken || getAuthToken()
  
  // HARDCODED: Always use this exact backend URL - no environment variables
  // Using const to ensure it's never modified
  const BACKEND_BASE_URL: string = 'https://trade-backend-production-b0a3.up.railway.app'
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Construct absolute URL using string concatenation (not template literal to avoid any issues)
  const fullUrl: string = BACKEND_BASE_URL + cleanPath
  
  // CRITICAL: Validate URL is absolute - throw error if not
  if (!fullUrl.startsWith('https://trade-backend-production')) {
    const errorMsg = `FATAL: URL is not pointing to backend! URL: "${fullUrl}", Path: "${path}", Backend: "${BACKEND_BASE_URL}"`
    console.error('🚨 [apiFetch]', errorMsg)
    console.error('🚨 [apiFetch] Full URL type:', typeof fullUrl, 'Value:', JSON.stringify(fullUrl))
    throw new Error(errorMsg)
  }
  
  // Log for debugging - use console.error to ensure it shows up
  console.error('✅ [apiFetch] Making request:', method, '→', fullUrl)
  console.error('✅ [apiFetch] Backend URL constant:', BACKEND_BASE_URL)
  console.error('✅ [apiFetch] Path:', cleanPath)
  
  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }
  
  // Always add Authorization header if token exists
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
    console.log('[apiFetch] Authorization header added')
  } else {
    console.warn('[apiFetch] No token available - request may fail if auth is required')
  }
  
  // Final URL - ensure it's the backend URL (triple check)
  let finalUrl = fullUrl
  
  // Last resort: if somehow the URL is wrong, force it to be correct
  if (!finalUrl.includes('trade-backend-production')) {
    console.error('🚨 [apiFetch] URL CORRUPTED! Forcing correct URL.')
    finalUrl = 'https://trade-backend-production-b0a3.up.railway.app' + cleanPath
  }
  
  // Final validation
  if (!finalUrl.startsWith('https://trade-backend-production')) {
    throw new Error(`CRITICAL: URL is wrong! Expected backend URL but got: ${finalUrl}`)
  }
  
  console.error('🚨 [apiFetch] FINAL URL BEING FETCHED:', finalUrl)
  console.error('🚨 [apiFetch] URL is correct?', finalUrl.includes('trade-backend-production'))
  console.error('🚨 [apiFetch] Full URL object:', { fullUrl, finalUrl, cleanPath, BACKEND_BASE_URL })
  
  const res = await fetch(finalUrl, {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies in the request
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[apiFetch] Request failed:', res.status, text)
    
    // Handle 401 Unauthorized - token expired or invalid
    if (res.status === 401) {
      // Clear invalid token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        // Dispatch event to notify auth system
        window.dispatchEvent(new CustomEvent('auth-token-expired'))
      }
      // Try to parse error message
      let errorMessage = 'Your session has expired. Please sign in again.'
      try {
        const errorData = JSON.parse(text)
        if (errorData.error === 'Invalid token') {
          errorMessage = 'Your session has expired. Please sign in again.'
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch {
        // Use default message
      }
      throw new Error(errorMessage)
    }
    
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return (await res.json()) as T
}


