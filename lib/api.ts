// Hardcoded backend URL (closed repo - no need for env vars)
export const backendBaseUrl = 'https://www.backend.mytradejournal.co.in'

// Force log on module load to verify it's being used
if (typeof window !== 'undefined') {
  console.log('🔧 [api.ts] MODULE LOADED - Backend URL is:', backendBaseUrl)
  console.log('🔧 [api.ts] Type:', typeof backendBaseUrl)
  console.log('🔧 [api.ts] Length:', backendBaseUrl?.length)
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Get auth token from localStorage or cookies
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') {
    console.warn('[getAuthToken] Running server-side - cannot access localStorage')
    return undefined
  }
  
  // Try localStorage first (client-side auth)
  let token = localStorage.getItem('token')
  
  // If no token in localStorage, check URL (might be from OAuth redirect)
  if (!token && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      console.log('[getAuthToken] 🔍 Found token in URL! Storing in localStorage...')
      try {
        token = decodeURIComponent(urlToken)
        localStorage.setItem('token', token)
        localStorage.setItem('oauth_token_fresh', 'true')
        // Dispatch event to trigger validation
        setTimeout(() => {
          window.dispatchEvent(new Event('auth-token-stored'))
        }, 50)
      } catch (e) {
        console.warn('[getAuthToken] Failed to decode token from URL')
        token = urlToken
        localStorage.setItem('token', token)
      }
    }
  }
  
  if (token) {
    console.log('[getAuthToken] ✅ Found token, length:', token.length)
    console.log('[getAuthToken] Token preview:', token.substring(0, 30) + '...')
    return token
  }
  
  // Log what keys are available for debugging
  console.error('[getAuthToken] ❌ No token found in localStorage or URL!')
  console.error('[getAuthToken] localStorage keys:', Object.keys(localStorage))
  console.error('[getAuthToken] localStorage.getItem("token"):', localStorage.getItem('token'))
  console.error('[getAuthToken] URL search:', window.location.search)
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
  const BACKEND_BASE_URL: string = 'https://www.backend.mytradejournal.co.in'
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Construct absolute URL using string concatenation (not template literal to avoid any issues)
  const fullUrl: string = BACKEND_BASE_URL + cleanPath
  
  // CRITICAL: Validate URL is absolute - throw error if not
  if (!fullUrl.startsWith('https://www.backend.mytradejournal.co.in')) {
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
    console.log('[apiFetch] ✅ Authorization header added, token length:', token.length)
    console.log('[apiFetch] Token preview:', token.substring(0, 30) + '...')
    console.log('[apiFetch] Full Authorization header:', `Bearer ${token.substring(0, 20)}...`)
  } else {
    console.error('[apiFetch] ❌ No token available - request may fail if auth is required')
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      console.error('[apiFetch] localStorage token check:', storedToken ? `Found (length: ${storedToken.length})` : 'NOT FOUND')
      console.error('[apiFetch] All localStorage keys:', Object.keys(localStorage))
      console.error('[apiFetch] Provided token?', !!providedToken)
    } else {
      console.error('[apiFetch] Running server-side - localStorage not available')
    }
  }
  
  // Final URL - ensure it's the backend URL (triple check)
  let finalUrl = fullUrl
  
  // Last resort: if somehow the URL is wrong, force it to be correct
  if (!finalUrl.includes('backend.mytradejournal.co.in')) {
    console.error('🚨 [apiFetch] URL CORRUPTED! Forcing correct URL.')
    finalUrl = 'https://www.backend.mytradejournal.co.in' + cleanPath
  }
  
  // Final validation
  if (!finalUrl.startsWith('https://www.backend.mytradejournal.co.in')) {
    throw new Error(`CRITICAL: URL is wrong! Expected backend URL but got: ${finalUrl}`)
  }
  
  console.error('🚨 [apiFetch] FINAL URL BEING FETCHED:', finalUrl)
  console.error('🚨 [apiFetch] URL is correct?', finalUrl.includes('backend.mytradejournal.co.in'))
  console.error('🚨 [apiFetch] Request headers:', JSON.stringify(requestHeaders, null, 2))
  console.error('🚨 [apiFetch] Has Authorization header?', !!requestHeaders['Authorization'])
  console.error('🚨 [apiFetch] Token exists?', !!token)
  console.error('🚨 [apiFetch] Full URL object:', { fullUrl, finalUrl, cleanPath, BACKEND_BASE_URL })
  
  const res = await fetch(finalUrl, {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies in the request
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  })
  
  // Log response headers for debugging
  console.log('[apiFetch] Response status:', res.status)
  console.log('[apiFetch] Response headers:', Object.fromEntries(res.headers.entries()))

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[apiFetch] Request failed:', res.status, text)
    
    // Handle 401 Unauthorized - token expired or invalid
    if (res.status === 401) {
      console.error('[apiFetch] ❌ Got 401 Unauthorized')
      console.error('[apiFetch] Response text:', text)
      console.error('[apiFetch] URL:', finalUrl)
      console.error('[apiFetch] Token was provided?', !!token)
      
      // Check if this is a fresh OAuth token (from URL params or localStorage flag)
      const isFreshOAuthToken = typeof window !== 'undefined' && 
        (window.location.search.includes('token=') || 
         localStorage.getItem('oauth_token_fresh') === 'true' ||
         document.referrer.includes('google.com') ||
         document.referrer.includes('accounts.google.com'))
      
      if (isFreshOAuthToken) {
        console.warn('[apiFetch] ⚠️ Got 401 but token is fresh from OAuth - NOT clearing token, might be timing issue')
        console.warn('[apiFetch] ⚠️ Token will be kept - validation will retry')
        // Don't clear the token - it might be valid but the backend needs a moment
        // Or there might be a CORS/preflight issue
      } else {
        // Clear invalid token from localStorage only if it's not a fresh token
        console.warn('[apiFetch] Clearing invalid token from localStorage')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          localStorage.removeItem('userEmail')
          // Dispatch event to notify auth system
          window.dispatchEvent(new CustomEvent('auth-token-expired'))
        }
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


