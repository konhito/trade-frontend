import { type NextRequest, NextResponse } from "next/server"

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

  // Simple locale routing - redirect root to /en
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", req.url))
  }

  // If accessing a route without locale, redirect to /en
  if (!pathname.startsWith("/en") && !pathname.startsWith("/fr")) {
    const url = req.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
