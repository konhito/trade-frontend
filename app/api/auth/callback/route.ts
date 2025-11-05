import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const next = searchParams.get('next') || '/dashboard'
  
  if (!token) {
    // No token, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Decode the next URL
  let nextUrl = '/dashboard'
  if (next) {
    try {
      const decoded = decodeURIComponent(next)
      if (decoded.startsWith('/')) {
        nextUrl = decoded
      }
    } catch {
      // Invalid encoding, use default
    }
  }
  
  // Redirect to homepage with token - homepage will detect and handle it
  const homepageUrl = new URL('/', request.url)
  homepageUrl.searchParams.set('token', token)
  homepageUrl.searchParams.set('next', encodeURIComponent(nextUrl))
  
  return NextResponse.redirect(homepageUrl)
}
