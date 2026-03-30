import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ky, { TimeoutError } from 'ky'
import { LoginRequest, LoginResponse, User } from '@/types/auth.types'
import { config } from '@/lib/env'
import { ROUTES } from '@/lib/routes'
import { validateMatricule } from '@/lib/validations'
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: LoginRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body. Please try again.',
        } as LoginResponse,
        { status: 400 }
      )
    }

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

    // Validate matricule format
    const matriculeError = validateMatricule(body.matricule)
    if (matriculeError) {
      return NextResponse.json(
        { success: false, message: matriculeError } as LoginResponse,
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
        retry: 0, // No retries for login — avoids duplicate auth attempts and compounding timeouts
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
          email: string
          name: string
          roles: string[]
          batch?: string
          specialization?: string
          status: string
          profile_completed: boolean
          profileCompleted: boolean
          last_login_at?: string
          lastLoginAt?: string
          created_at?: string
          createdAt: string
          updated_at?: string
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

    // Derive first/last name from the full name field
    const nameParts = (backendResponse.user.name ?? '').trim().split(/\s+/)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ')

    const user: User = {
      id: backendResponse.user.id,
      matricule: backendResponse.user.matricule,
      email: backendResponse.user.email ?? '',
      name: backendResponse.user.name,
      batch: backendResponse.user.batch,
      specialization: backendResponse.user.specialization,
      status: backendResponse.user.status ?? 'ACTIVE',
      roles: backendResponse.user.roles ?? [],
      profileCompleted: backendResponse.user.profileCompleted ?? false,
      lastLoginAt:
        backendResponse.user.lastLoginAt ?? backendResponse.user.last_login_at,
      createdAt:
        backendResponse.user.createdAt ?? backendResponse.user.created_at,
      updatedAt:
        backendResponse.user.updatedAt ?? backendResponse.user.updated_at,
      firstName,
      lastName,
      profilePicture: backendResponse.user.profilePicture,
    }

    // Always redirect to /dashboard — role-based view is handled client-side
    const redirectUrl = ROUTES.DASHBOARD

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user,
        message: 'Login successful',
        redirectUrl,
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
    if (error instanceof TimeoutError) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Authentication service is temporarily unavailable. Please try again.',
        } as LoginResponse,
        { status: 503 }
      )
    }

    if (error instanceof Error) {
      // Network or timeout errors (fallback string check)
      if (
        error.message.includes('timeout') ||
        error.message.includes('fetch') ||
        error.name === 'TimeoutError'
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
