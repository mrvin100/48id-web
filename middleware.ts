/**
 * Next.js Middleware for Authentication and Route Protection
 *
 * This middleware handles:
 * - Route protection for authenticated users only
 * - Role-based access control for admin users
 * - Automatic redirects for unauthenticated users
 * - Token validation and refresh
 *
 * Requirements: 1.5, 10.2
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { config as envConfig } from '@/lib/env'
import { ROUTES } from '@/lib/routes'

// JWT Secret for token verification
const JWT_SECRET = new TextEncoder().encode(envConfig.auth.jwtSecret)

// Route configuration
const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.ACCESS_DENIED,
  ROUTES.HOME, // Landing page
]

const API_ROUTES = ['/api/auth/login', '/api/auth/logout', '/api/auth/refresh']

const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.CSV_IMPORT,
  ROUTES.AUDIT,
  ROUTES.API_KEYS,
]

// Admin-only routes (require ADMIN or SYSTEM_OPERATOR role)
const ADMIN_ROUTES = [
  ROUTES.USERS,
  ROUTES.CSV_IMPORT,
  ROUTES.AUDIT,
  ROUTES.API_KEYS,
  '/api/users',
  '/api/csv',
  '/api/audit',
  '/api/api-keys',
  '/api/dashboard',
  '/api/admin', // Add this to cover all admin API routes
]

interface TokenPayload {
  sub: string // user ID
  matricule: string
  role: 'ADMIN' | 'SYSTEM_OPERATOR' | 'STUDENT'
  iat: number
  exp: number
  iss: string
}

/**
 * Verify JWT token and extract payload
 */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Validate that the payload has the required fields
    if (
      typeof payload.sub === 'string' &&
      typeof payload.matricule === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      return payload as unknown as TokenPayload
    }

    return null
  } catch (error) {
    console.warn('Token verification failed:', error)
    return null
  }
}

/**
 * Check if user has required role for admin access
 */
function hasAdminAccess(role: string): boolean {
  return role === 'ADMIN' || role === 'SYSTEM_OPERATOR'
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if route requires admin access
 */
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if route is public (no authentication required)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route)
  )
}

/**
 * Check if route is an API route that should be handled separately
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

/**
 * Check if route should be skipped by middleware
 */
function shouldSkipRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // Static files
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (shouldSkipRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Handle API routes separately
  if (isApiRoute(pathname)) {
    // Allow auth API routes
    if (API_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Protect other API routes
    const token = request.cookies.get(envConfig.auth.jwtCookieName)?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check admin access for admin API routes
    if (isAdminRoute(pathname) && !hasAdminAccess(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.sub)
    response.headers.set('x-user-matricule', payload.matricule)
    response.headers.set('x-user-role', payload.role)

    return response
  }

  // Handle protected page routes
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get(envConfig.auth.jwtCookieName)?.value

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL(ROUTES.LOGIN, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifyToken(token)

    if (!payload) {
      // Token is invalid, try to refresh
      const refreshToken = request.cookies.get(
        envConfig.auth.refreshCookieName
      )?.value

      if (refreshToken) {
        // Attempt token refresh
        try {
          const refreshResponse = await fetch(
            new URL('/api/auth/refresh', request.url),
            {
              method: 'POST',
              headers: {
                Cookie: `${envConfig.auth.refreshCookieName}=${refreshToken}`,
              },
            }
          )

          if (refreshResponse.ok) {
            // Token refreshed successfully, continue with request
            const response = NextResponse.next()

            // Copy new cookies from refresh response
            const setCookieHeader = refreshResponse.headers.get('set-cookie')
            if (setCookieHeader) {
              response.headers.set('set-cookie', setCookieHeader)
            }

            return response
          }
        } catch (error) {
          console.warn('Token refresh failed:', error)
        }
      }

      // Refresh failed or no refresh token, redirect to login
      const loginUrl = new URL(ROUTES.LOGIN, request.url)
      loginUrl.searchParams.set('redirect', pathname)

      // Clear invalid cookies
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(envConfig.auth.jwtCookieName)
      response.cookies.delete(envConfig.auth.refreshCookieName)

      return response
    }

    // Check role-based access for admin routes
    if (isAdminRoute(pathname) && !hasAdminAccess(payload.role)) {
      // Redirect to access denied page
      return NextResponse.redirect(new URL(ROUTES.ACCESS_DENIED, request.url))
    }

    // User is authenticated and authorized, continue
    return NextResponse.next()
  }

  // For all other routes, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
