import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ky from 'ky'
import { RefreshTokenResponse } from '@/types/auth.types'
import { config } from '@/lib/env'

// Shape returned by backend POST /api/v1/auth/refresh
interface BackendRefreshResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(config.auth.refreshCookieName)?.value

    // Check if refresh token exists
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No refresh token available',
        } as RefreshTokenResponse,
        { status: 401 }
      )
    }

    try {
      // Call backend token refresh API.
      // The backend expects the refresh token in the JSON body as { refresh_token: "..." }.
      // It returns { access_token, refresh_token, token_type, expires_in } on success.
      const backendResponse = await ky
        .post(`${config.backend.apiUrl}/auth/refresh`, {
          json: { refresh_token: refreshToken },
          timeout: config.backend.timeout,
          retry: 0, // No retries — avoids duplicate refresh calls
        })
        .json<BackendRefreshResponse>()

      if (!backendResponse.access_token) {
        // Unexpected empty response — don't clear cookies (tokens may still be valid)
        return NextResponse.json(
          {
            success: false,
            message: 'Token refresh failed',
          } as RefreshTokenResponse,
          { status: 401 }
        )
      }

      // Update access token cookie with the new JWT
      cookieStore.set(config.auth.jwtCookieName, backendResponse.access_token, {
        httpOnly: true,
        secure: config.security.secureCookies,
        sameSite: 'strict',
        maxAge: backendResponse.expires_in ?? 60 * 60 * 24,
        path: '/',
      })

      // Rotate refresh token cookie if the backend issued a new one
      if (backendResponse.refresh_token) {
        cookieStore.set(
          config.auth.refreshCookieName,
          backendResponse.refresh_token,
          {
            httpOnly: true,
            secure: config.security.secureCookies,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Token refreshed successfully',
        } as RefreshTokenResponse,
        { status: 200 }
      )
    } catch (backendError) {
      console.error('Backend refresh error:', backendError)

      // Only clear cookies when the backend explicitly rejects the token (401).
      // Do NOT clear on 500 (backend error) or network issues — the tokens are
      // still valid and clearing them forces an unnecessary re-login.
      const isTokenInvalid =
        backendError instanceof Error &&
        (backendError.message.includes('401') ||
          backendError.message.includes('REFRESH_TOKEN_INVALID'))

      if (isTokenInvalid) {
        cookieStore.delete(config.auth.refreshCookieName)
        cookieStore.delete(config.auth.jwtCookieName)
        return NextResponse.json(
          {
            success: false,
            message: 'Session expired. Please login again.',
          } as RefreshTokenResponse,
          { status: 401 }
        )
      }

      // Backend 500 or network error — return 503, keep cookies intact
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication service is temporarily unavailable.',
        } as RefreshTokenResponse,
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Refresh token error:', error)

    // Clear cookies on any error
    const cookieStore = await cookies()
    cookieStore.delete(config.auth.refreshCookieName)
    cookieStore.delete(config.auth.jwtCookieName)

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please login again.',
      } as RefreshTokenResponse,
      { status: 500 }
    )
  }
}
