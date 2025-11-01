import { type NextRequest, NextResponse } from "next/server"
// Temporarily removed next-international to fix Edge runtime __dirname error
// Will re-enable once Edge compatibility is confirmed
// import { createI18nMiddleware } from "next-international/middleware"

// Maintenance mode flag - Set to true to enable maintenance mode
const MAINTENANCE_MODE = false

// Simple i18n handler - basic locale detection from pathname
function handleI18n(req: NextRequest): NextResponse {
  const pathname = req.nextUrl.pathname
  const localeMatch = pathname.match(/^\/(en|fr)(\/|$)/)
  const locale = localeMatch ? localeMatch[1] : 'en'
  
  // If pathname doesn't have locale prefix, add it
  if (!localeMatch && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

async function updateSession(request: NextRequest) {
  // Create a proper NextResponse first
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check for JWT token in cookies (backend auth)
  const token = request.cookies.get("auth_token")?.value
  let user: { id?: string; email?: string } | null = null
  let error: unknown = null

  if (token) {
    try {
      // Simple token validation - in production, verify JWT signature
      // For now, just check if token exists (backend will validate)
      const userId = request.cookies.get("user_id")?.value
      const userEmail = request.cookies.get("user_email")?.value
      
      if (userId) {
        user = { id: userId, email: userEmail || undefined }
        response.headers.set("x-user-id", userId)
        if (userEmail) response.headers.set("x-user-email", userEmail)
        response.headers.set("x-auth-status", "authenticated")
      }
    } catch (authError) {
      console.warn("Auth check failed:", authError)
      user = null
      error = authError
    }
  }

  if (!user || error) {
    response.headers.set("x-auth-status", "unauthenticated")
    if (error) {
      response.headers.set("x-auth-error", (error as any).message || "Unknown error")
    }
  }

  return { response, user, error }
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // More specific static asset exclusions - must be first!
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes("/opengraph-image") ||
    pathname.includes("/twitter-image") ||
    pathname.includes("/icon")
  ) {
    return NextResponse.next()
  }

  // Apply simple i18n handling (Edge compatible)
  const i18nResponse = handleI18n(req)
  
  // If i18n handler redirected, return it immediately
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
    return i18nResponse
  }
  
  const response = i18nResponse

  // Then update session
  const { response: authResponse, user, error } = await updateSession(req)

  // Merge responses - copy headers from auth response to i18n response
  authResponse.headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  // Copy cookies from auth response
  authResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as any,
    })
  })

  // Maintenance mode check
  if (MAINTENANCE_MODE && !pathname.includes("/maintenance") && pathname.includes("/dashboard")) {
    return NextResponse.redirect(new URL("/maintenance", req.url))
  }

  // Authentication checks with better error handling
  if (!user || error) {
    const isPublicRoute = !pathname.includes("/dashboard")
    if (!isPublicRoute) {
      const encodedSearchParams = `${pathname.substring(1)}${req.nextUrl.search}`
      const authUrl = new URL("/login", req.url)

      if (encodedSearchParams) {
        authUrl.searchParams.append("next", encodedSearchParams)
      }

      // Add error context for debugging
      if (error) {
        authUrl.searchParams.set("auth_error", "session_invalid")
      }

      return NextResponse.redirect(authUrl)
    }
  } else {
    // Authenticated - redirect from auth pages to dashboard
    if (pathname.includes("/login") || pathname.includes("/register")) {
      const nextParam = req.nextUrl.searchParams.get("next")
      const redirectUrl = nextParam ? `/${nextParam}` : "/dashboard"
      // Use the i18n response for redirect to maintain locale
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
  }

  // Geolocation handling using Vercel headers (Edge compatible)
  // Using headers directly instead of @vercel/functions for better Edge runtime compatibility
  const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry")
  const city = req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity")
  const region = req.headers.get("x-vercel-ip-country-region") || req.headers.get("cf-region")

  if (country) {
    response.headers.set("x-user-country", country)
    response.cookies.set("user-country", country, {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }
  if (city) {
    response.headers.set("x-user-city", encodeURIComponent(city))
  }
  if (region) {
    response.headers.set("x-user-region", encodeURIComponent(region))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * - opengraph-image (Open Graph image generation)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|api|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

// Middleware always runs on Edge runtime by default - no need to export runtime
