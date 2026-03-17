import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ky from 'ky'
import {
  LoginRequest,
  LoginResponse,
  User,
  UserRole,
  UserStatus,
} from '@/types/auth.types'
import { config } from '@/lib/env'
import { ROUTES } from '@/lib/routes'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LoginRequest = await request.json()

    // Validate required fields
    if (!body.matricule || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Matricule and password are required',
        } as LoginResponse,
        { status: 400 }
      )
    }

    // Validate matricule format (basic validation)
    if (!/^[A-Z0-9]{6,12}$/.test(body.matricule)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid matricule format',
        } as LoginResponse,
        { status: 400 }
      )
    }

    // Call backend authentication API
    const backendResponse = await ky
      .post(`${config.backend.apiUrl}/auth/login`, {
        json: {
          matricule: body.matricule,
          password: body.password,
        },
        timeout: config.backend.timeout,
        retry: {
          limit: config.backend.retryLimit,
          methods: ['post'],
        },
      })
      .json<{
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
        }
        token?: string
        refreshToken?: string
        message?: string
      }>()

    if (
      !backendResponse.success ||
      !backendResponse.token ||
      !backendResponse.user
    ) {
      return NextResponse.json(
        {
          success: false,
          message: backendResponse.message || 'Authentication failed',
        } as LoginResponse,
        { status: 401 }
      )
    }

    // Transform backend user data to frontend User interface
    const user: User = {
      id: backendResponse.user.id,
      matricule: backendResponse.user.matricule,
      email: backendResponse.user.email,
      name:
        (backendResponse.user as any).name ||
        `${backendResponse.user.firstName} ${backendResponse.user.lastName}`,
      phone: (backendResponse.user as any).phone,
      batch: (backendResponse.user as any).batch,
      specialization: (backendResponse.user as any).specialization,
      status: backendResponse.user.status,
      roles: (backendResponse.user as any).roles || [backendResponse.user.role],
      profileCompleted:
        (backendResponse.user as any).profileCompleted ??
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
      return NextResponse.json(
        {
          success: false,
          message:
            'Access denied. Admin portal is restricted to administrators only.',
          redirectUrl: ROUTES.ACCESS_DENIED,
        } as LoginResponse,
        { status: 403 }
      )
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user,
        message: 'Login successful',
        redirectUrl: ROUTES.DASHBOARD,
      } as LoginResponse,
      { status: 200 }
    )

    // Set HttpOnly cookies for tokens
    const cookieStore = await cookies()

    // Set JWT token cookie
    cookieStore.set(config.auth.jwtCookieName, backendResponse.token, {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Set refresh token cookie if provided
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
  } catch (error) {
    console.error('Login error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      // Network or timeout errors
      if (
        error.message.includes('timeout') ||
        error.message.includes('fetch')
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Authentication service is temporarily unavailable. Please try again.',
          } as LoginResponse,
          { status: 503 }
        )
      }

      // Rate limiting or other HTTP errors
      if (error.message.includes('429')) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Too many login attempts. Please wait before trying again.',
          } as LoginResponse,
          { status: 429 }
        )
      }
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      } as LoginResponse,
      { status: 500 }
    )
  }
}
