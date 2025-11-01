import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is trying to access dashboard without authentication
  if (pathname.startsWith('/dashboard')) {
    const authCookie = request.cookies.get('simple-auth')
    
    if (!authCookie) {
      // Redirect to simple login if not authenticated
      return NextResponse.redirect(new URL('/simple-login', request.url))
    }

    try {
      // Verify the cookie is valid
      const authData = JSON.parse(authCookie.value)
      if (!authData.userId || !authData.email) {
        return NextResponse.redirect(new URL('/simple-login', request.url))
      }
    } catch (error) {
      // Invalid cookie, redirect to login
      return NextResponse.redirect(new URL('/simple-login', request.url))
    }
  }

  // If accessing simple-login while already authenticated, redirect to dashboard
  if (pathname === '/simple-login') {
    const authCookie = request.cookies.get('simple-auth')
    
    if (authCookie) {
      try {
        const authData = JSON.parse(authCookie.value)
        if (authData.userId && authData.email) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        // Invalid cookie, allow access to login page
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/simple-login'
  ]
}

