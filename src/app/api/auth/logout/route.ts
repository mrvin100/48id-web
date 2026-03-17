import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ky from 'ky'
import { LogoutResponse } from '@/types/auth.types'
import { config } from '@/lib/env'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(config.auth.jwtCookieName)?.value
    const refreshToken = cookieStore.get(config.auth.refreshCookieName)?.value

    // If no token exists, consider logout successful
    if (!token) {
      return NextResponse.json(
        {
          success: true,
          message: 'Already logged out',
        } as LogoutResponse,
        { status: 200 }
      )
    }

    try {
      // Notify backend about logout to invalidate refresh token
      if (refreshToken) {
        await ky.post(`${config.backend.apiUrl}/auth/logout`, {
          json: {
            refreshToken: refreshToken,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: config.backend.timeout,
          retry: {
            limit: 1,
            methods: ['post'],
          },
        })
      }
    } catch (backendError) {
      // Log backend error but don't fail logout
      // 401 is expected if token is already invalid/expired
      console.log('Backend logout completed (token may be expired)')
      // Continue with cookie cleanup regardless of backend response
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      } as LogoutResponse,
      { status: 200 }
    )

    // Clear authentication cookies
    cookieStore.delete(config.auth.jwtCookieName)
    cookieStore.delete(config.auth.refreshCookieName)

    // Also set expired cookies as fallback
    response.cookies.set(config.auth.jwtCookieName, '', {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    response.cookies.set(config.auth.refreshCookieName, '', {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)

    // Even if there's an error, we should clear cookies and return success
    // because the user intent is to logout
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout completed (with warnings)',
      } as LogoutResponse,
      { status: 200 }
    )

    // Clear cookies regardless of errors
    const cookieStore = await cookies()
    cookieStore.delete(config.auth.jwtCookieName)
    cookieStore.delete(config.auth.refreshCookieName)

    response.cookies.set(config.auth.jwtCookieName, '', {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    response.cookies.set(config.auth.refreshCookieName, '', {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  }
}
