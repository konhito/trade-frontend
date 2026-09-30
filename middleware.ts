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
  if (hostname.includes('admin.mytradejournal.co.in') || hostname.includes('www.admin.mytradejournal.co.in')) {
    // If not on admin routes, redirect to /admin
    if (!pathname.startsWith('/admin')) {
      const adminUrl = new URL('/admin', request.url)
      return NextResponse.redirect(adminUrl)
    }
    // Allow access to /admin routes (client-side will handle auth)
    return NextResponse.next()
  }
  
  // Keep the legacy platform administration area on the admin subdomain.
  // The public tracker editor at /admin is intentionally reachable without login.
  const isRestrictedAdminPath = pathname.startsWith('/admin/platform') || pathname.startsWith('/admin/login')
  if (isRestrictedAdminPath && !hostname.includes('admin.mytradejournal.co.in') && !hostname.includes('www.admin.mytradejournal.co.in') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    return NextResponse.redirect(new URL('/', request.url))
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

  // Let /algo routes pass completely unhindered
  if (pathname.startsWith('/algo')) {
    return NextResponse.next()
  }

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

