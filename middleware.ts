import { type NextRequest, NextResponse } from "next/server"

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

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Exclude static assets and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next()
  }

  // Apply simple i18n handling
  const response = handleI18n(req)
  
  // If i18n handler redirected, return it immediately
  if (response.status === 307 || response.status === 308) {
    return response
  }

  // Simple authentication check - protect dashboard routes
  const token = req.cookies.get("auth_token")?.value
  const isPublicRoute = !pathname.includes("/dashboard")

  if (!token && !isPublicRoute) {
    const authUrl = new URL("/login", req.url)
    authUrl.searchParams.set("next", pathname.substring(1))
    return NextResponse.redirect(authUrl)
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
