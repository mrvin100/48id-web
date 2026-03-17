import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ky from 'ky'
import { LoginRequest, LoginResponse, User, UserRole } from '@/types/auth.types'
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

    // Validate matricule format (K48-YYYY-XXX format)
    if (!/^K48-\d{4}-\d{3}$/.test(body.matricule)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid matricule format. Expected format: K48-YYYY-XXX',
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
        access_token: string
        refresh_token: string
        token_type: string
        expires_in: number
        requires_password_change: boolean
        user: {
          id: string
          matricule: string
          name: string
          email: string
          role: string
          batch?: string
          specialization?: string
          phone?: string
          status: string
          profileCompleted: boolean
          lastLoginAt?: string
          createdAt: string
          updatedAt: string
          profilePicture?: string
        }
      }>()

    if (!backendResponse.access_token || !backendResponse.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication failed',
        } as LoginResponse,
        { status: 401 }
      )
    }

    // Transform backend user data to frontend User interface
    const user: User = {
      id: backendResponse.user.id,
      matricule: backendResponse.user.matricule,
      email: backendResponse.user.email,
      name: backendResponse.user.name,
      phone: backendResponse.user.phone,
      batch: backendResponse.user.batch,
      specialization: backendResponse.user.specialization,
      status: backendResponse.user.status,
      roles: [backendResponse.user.role],
      profileCompleted: backendResponse.user.profileCompleted,
      lastLoginAt: backendResponse.user.lastLoginAt,
      createdAt: backendResponse.user.createdAt,
      updatedAt: backendResponse.user.updatedAt,
      firstName: backendResponse.user.name?.split(' ')[0] || '',
      lastName: backendResponse.user.name?.split(' ').slice(1).join(' ') || '',
      role: backendResponse.user.role as UserRole,
      isEmailVerified: backendResponse.user.profileCompleted,
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
    cookieStore.set(config.auth.jwtCookieName, backendResponse.access_token, {
      httpOnly: true,
      secure: config.security.secureCookies,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Set refresh token cookie if provided
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
