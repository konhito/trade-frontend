import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/trade-diary']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/signin', '/signup', '/authentication']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Check if accessing admin subdomain
  if (hostname.includes('admin.mytradingjournal.co.in') || hostname.includes('admin.mytradejournal.co.in')) {
    // If not already on /admin route, redirect to it
    if (!pathname.startsWith('/admin')) {
      const adminUrl = new URL('/admin', request.url)
      adminUrl.hostname = hostname
      return NextResponse.redirect(adminUrl)
    }
    // Allow access to /admin route
    return NextResponse.next()
  }
  
  // Try to get token from cookie (set by backend/auth if needed)
  // Or check Authorization header
  const tokenCookie = request.cookies.get('token')?.value
  const authHeader = request.headers.get('authorization')
  const token = tokenCookie || (authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null)

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  // Don't redirect protected routes - let client-side handle authentication
  // Middleware can't access localStorage, so we can't check tokens stored there
  // Client-side components will handle redirects and auth checks

  // If accessing auth route with token in cookie/header, redirect to dashboard
  // This only works if token is in cookies/headers (not localStorage)
  if (isAuthRoute && token && token.length > 20) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

