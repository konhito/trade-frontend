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

  // Simple authentication check - protect dashboard routes
  const token = req.cookies.get("auth_token")?.value
  const isPublicRoute = !pathname.includes("/dashboard")

  if (!token && !isPublicRoute) {
    const authUrl = new URL("/login", req.url)
    authUrl.searchParams.set("next", pathname.substring(1))
    return NextResponse.redirect(authUrl)
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

// Middleware always runs on Edge runtime by default - no need to export runtime
