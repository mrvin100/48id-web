import { NextRequest, NextResponse } from 'next/server'

// Authentication middleware - implementation coming in Sprint 1
export function middleware(request: NextRequest) {
  // Skip middleware for public routes and API routes during development
  const { pathname } = request.nextUrl

  // Allow access to login page and public assets
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // For now, allow all requests during development
  // Authentication logic will be implemented in Sprint 1
  console.log(
    `Middleware: ${pathname} - Authentication logic coming in Sprint 1`
  )

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
