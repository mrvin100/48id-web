/**
 * Next.js Middleware for Authentication and Route Protection
 *
 * This middleware handles:
 * - Route protection for authenticated users only
 * - Role-based access control (ADMIN, OPERATOR)
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
  ROUTES.HOME,
  ROUTES.ACTIVATE_ACCOUNT,
  ROUTES.RESET_PASSWORD,
]

const API_ROUTES = [
  ROUTES.API.AUTH.LOGIN,
  ROUTES.API.AUTH.LOGOUT,
  ROUTES.API.AUTH.REFRESH,
  ROUTES.API.AUTH.ACTIVATE,
  ROUTES.API.AUTH.RESET_PASSWORD,
]

const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.CSV_IMPORT,
  ROUTES.AUDIT,
  ROUTES.API_KEYS,
  ROUTES.OPERATOR.DASHBOARD,
  ROUTES.OPERATOR.USERS,
  ROUTES.OPERATOR.AUDIT,
  ROUTES.OPERATOR.TRAFFIC,
  ROUTES.OPERATOR.API_KEY,
]

// Admin-only page routes
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
  '/api/admin',
]

// Operator-only page routes
const OPERATOR_ROUTES = [
  ROUTES.OPERATOR.DASHBOARD,
  ROUTES.OPERATOR.USERS,
  ROUTES.OPERATOR.AUDIT,
  ROUTES.OPERATOR.TRAFFIC,
  ROUTES.OPERATOR.API_KEY,
  '/api/operator',
]

interface TokenPayload {
  sub: string
  matricule: string
  role: 'ADMIN' | 'OPERATOR' | 'STUDENT'
  iat: number
  exp: number
  iss: string
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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

function hasAdminAccess(role: string): boolean {
  return role.split(',').some(r => r.trim() === 'ROLE_ADMIN' || r.trim() === 'ADMIN')
}

function hasOperatorAccess(role: string): boolean {
  return role.split(',').some(r => r.trim() === 'ROLE_OPERATOR' || r.trim() === 'OPERATOR')
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

function isOperatorRoute(pathname: string): boolean {
  return OPERATOR_ROUTES.some(route => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    route === ROUTES.HOME ? pathname === route : pathname.startsWith(route)
  )
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

function shouldSkipRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldSkipRoute(pathname)) return NextResponse.next()
  if (isPublicRoute(pathname)) return NextResponse.next()

  // Handle API routes
  if (isApiRoute(pathname)) {
    if (API_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

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

    if (isAdminRoute(pathname) && !hasAdminAccess(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    if (isOperatorRoute(pathname) && !hasOperatorAccess(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

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
      const loginUrl = new URL(ROUTES.LOGIN, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifyToken(token)

    if (!payload) {
      const refreshToken = request.cookies.get(
        envConfig.auth.refreshCookieName
      )?.value

      if (refreshToken) {
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
            const response = NextResponse.next()
            const setCookieHeaders =
              refreshResponse.headers.getSetCookie?.() ??
              refreshResponse.headers.get('set-cookie')?.split(', ') ??
              []
            for (const cookie of setCookieHeaders) {
              response.headers.append('set-cookie', cookie)
            }
            return response
          }
        } catch (error) {
          console.warn('Token refresh failed:', error)
        }
      }

      const loginUrl = new URL(ROUTES.LOGIN, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(envConfig.auth.jwtCookieName)
      response.cookies.delete(envConfig.auth.refreshCookieName)
      return response
    }

    // OPERATOR trying to access admin routes → access denied
    if (isAdminRoute(pathname) && !hasAdminAccess(payload.role)) {
      return NextResponse.redirect(new URL(ROUTES.ACCESS_DENIED, request.url))
    }

    // Non-OPERATOR trying to access operator routes → access denied
    if (isOperatorRoute(pathname) && !hasOperatorAccess(payload.role)) {
      return NextResponse.redirect(new URL(ROUTES.ACCESS_DENIED, request.url))
    }

    // OPERATOR hitting /dashboard → redirect to operator dashboard
    if (pathname === ROUTES.DASHBOARD && hasOperatorAccess(payload.role)) {
      return NextResponse.redirect(
        new URL(ROUTES.OPERATOR.DASHBOARD, request.url)
      )
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)'],
}
