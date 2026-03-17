import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ky from 'ky'
import { RefreshTokenResponse, User, UserRole } from '@/types/auth.types'
import { config } from '@/lib/env'

interface BackendRefreshResponse {
  success: boolean
  user?: {
    id: string
    matricule: string
    email: string
    firstName: string
    lastName: string
    status: string
    role: string
    createdAt: string
    updatedAt: string
    lastLoginAt?: string
    isEmailVerified?: boolean
    profilePicture?: string
    name?: string
    phone?: string
    batch?: string
    specialization?: string
    roles?: string[]
    profileCompleted?: boolean
  }
  token?: string
  refreshToken?: string
  expiresAt?: string
  message?: string
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
      // Call backend token refresh API
      const backendResponse = await ky
        .post(`${config.backend.apiUrl}/auth/refresh`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
          },
          timeout: config.backend.timeout,
          retry: {
            limit: config.backend.retryLimit,
            methods: ['post'],
          },
        })
        .json<BackendRefreshResponse>()

      if (
        !backendResponse.success ||
        !backendResponse.token ||
        !backendResponse.user
      ) {
        // Clear invalid refresh token
        cookieStore.delete(config.auth.refreshCookieName)
        cookieStore.delete(config.auth.jwtCookieName)

        return NextResponse.json(
          {
            success: false,
            message: backendResponse.message || 'Token refresh failed',
          } as RefreshTokenResponse,
          { status: 401 }
        )
      }

      // Transform backend user data to frontend User interface
      const user: User = {
        id: backendResponse.user.id,
        matricule: backendResponse.user.matricule,
        email: backendResponse.user.email,
        name:
          backendResponse.user.name ||
          `${backendResponse.user.firstName} ${backendResponse.user.lastName}`,
        phone: backendResponse.user.phone,
        batch: backendResponse.user.batch,
        specialization: backendResponse.user.specialization,
        status: backendResponse.user.status,
        roles: backendResponse.user.roles || [backendResponse.user.role],
        profileCompleted:
          backendResponse.user.profileCompleted ??
          backendResponse.user.isEmailVerified ??
          false,
        lastLoginAt: backendResponse.user.lastLoginAt,
        createdAt: backendResponse.user.createdAt,
        updatedAt: backendResponse.user.updatedAt,
        firstName: backendResponse.user.firstName,
        lastName: backendResponse.user.lastName,
        role: backendResponse.user.role as UserRole,
        isEmailVerified: backendResponse.user.isEmailVerified || false,
        profilePicture: backendResponse.user.profilePicture,
      }

      // Validate user role (only admin and system operators allowed)
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.SYSTEM_OPERATOR
      ) {
        // Clear tokens for unauthorized users
        cookieStore.delete(config.auth.refreshCookieName)
        cookieStore.delete(config.auth.jwtCookieName)

        return NextResponse.json(
          {
            success: false,
            message:
              'Access denied. Admin portal is restricted to administrators only.',
          } as RefreshTokenResponse,
          { status: 403 }
        )
      }

      // Create response
      const response = NextResponse.json(
        {
          success: true,
          user,
          expiresAt: backendResponse.expiresAt,
          message: 'Token refreshed successfully',
        } as RefreshTokenResponse,
        { status: 200 }
      )

      // Update JWT token cookie
      cookieStore.set(config.auth.jwtCookieName, backendResponse.token, {
        httpOnly: true,
        secure: config.security.secureCookies,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      // Update refresh token cookie if new one provided
      if (backendResponse.refreshToken) {
        cookieStore.set(
          config.auth.refreshCookieName,
          backendResponse.refreshToken,
          {
            httpOnly: true,
            secure: config.security.secureCookies,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          }
        )
      }

      return response
    } catch (backendError) {
      console.error('Backend refresh error:', backendError)

      // Clear potentially invalid tokens
      cookieStore.delete(config.auth.refreshCookieName)
      cookieStore.delete(config.auth.jwtCookieName)

      // Handle specific backend errors
      if (backendError instanceof Error) {
        if (
          backendError.message.includes('401') ||
          backendError.message.includes('403')
        ) {
          return NextResponse.json(
            {
              success: false,
              message: 'Refresh token expired or invalid. Please login again.',
            } as RefreshTokenResponse,
            { status: 401 }
          )
        }

        if (
          backendError.message.includes('timeout') ||
          backendError.message.includes('fetch')
        ) {
          return NextResponse.json(
            {
              success: false,
              message: 'Authentication service is temporarily unavailable.',
            } as RefreshTokenResponse,
            { status: 503 }
          )
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Token refresh failed. Please login again.',
        } as RefreshTokenResponse,
        { status: 401 }
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
