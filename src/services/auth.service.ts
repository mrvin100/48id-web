/**
 * Authentication Service Layer
 *
 * This service handles all authentication-related operations including
 * login, logout, token refresh, and user profile retrieval.
 *
 * Requirements: 1.1, 1.3, 1.4
 */

import ky, { HTTPError } from 'ky'
import {
  LoginCredentials,
  AuthResponse,
  User,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  AuthError,
} from '@/types/auth.types'

import { config } from '@/lib/env'

export class AuthService {
  private httpClient: typeof ky

  constructor() {
    this.httpClient = ky.create({
      prefixUrl: config.frontend.apiBase,
      timeout: config.backend.timeout,
      retry: {
        limit: config.backend.retryLimit,
        methods: ['get', 'post'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      hooks: {
        beforeError: [
          error => {
            // Add custom error handling
            console.error('AuthService HTTP Error:', error)
            return error
          },
        ],
      },
    })
  }

  /**
   * Authenticate user with matricule and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.httpClient
        .post('auth/login', {
          json: {
            matricule: credentials.matricule.trim().toUpperCase(),
            password: credentials.password,
            rememberMe: false, // Default to false for security
          },
        })
        .json<LoginResponse>()

      if (!response.success) {
        // Return failure with the exact BFF message — do not throw (avoids remapping)
        return {
          success: false,
          message: response.message || 'Login failed',
        }
      }

      return {
        success: response.success,
        user: response.user,
        message: response.message,
        expiresAt: undefined, // Not provided by login endpoint
      }
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleAuthError(error, 'Login failed')
    }
  }

  /**
   * Logout current user and clear session
   */
  async logout(): Promise<void> {
    try {
      const response = await this.httpClient
        .post('auth/logout')
        .json<LogoutResponse>()

      if (!response.success) {
        console.warn('Logout warning:', response.message)
        // Don't throw error for logout - always succeed from client perspective
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Don't throw error for logout - always succeed from client perspective
      // The user intent is to logout, so we should honor that regardless of server response
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<User | null> {
    try {
      const response = await this.httpClient
        .post('auth/refresh')
        .json<RefreshTokenResponse>()

      if (!response.success || !response.user) {
        throw new Error(response.message || 'Token refresh failed')
      }

      return response.user
    } catch (error) {
      console.error('Token refresh error:', error)
      throw this.handleAuthError(error, 'Token refresh failed')
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Use refresh token endpoint to get current user
      // This also validates the current session
      return await this.refreshToken()
    } catch (error) {
      console.error('Get current user error:', error)
      // Return null instead of throwing to indicate no authenticated user
      return null
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user !== null
    } catch {
      return false
    }
  }

  /**
   * Validate matricule format
   */
  validateMatricule(matricule: string): boolean {
    // Matricule should be 6-12 alphanumeric characters
    const matriculeRegex = /^[A-Z0-9]{6,12}$/
    return matriculeRegex.test(matricule.trim().toUpperCase())
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Handle and transform authentication errors
   */
  private handleAuthError(error: unknown, defaultMessage: string): AuthError {
    if (error instanceof HTTPError) {
      const status = error.response.status

      switch (status) {
        case 400:
          return {
            code: 'INVALID_REQUEST',
            message: 'Invalid request. Please check your input.',
          }
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials or session expired.',
          }
        case 403:
          return {
            code: 'FORBIDDEN',
            message: 'Access denied. Insufficient permissions.',
          }
        case 429:
          return {
            code: 'RATE_LIMITED',
            message: 'Too many attempts. Please wait before trying again.',
          }
        case 503:
          return {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Authentication service is temporarily unavailable.',
          }
        default:
          return {
            code: 'HTTP_ERROR',
            message: `Server error (${status}). Please try again.`,
          }
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return {
          code: 'TIMEOUT',
          message:
            'Request timed out. Please check your connection and try again.',
        }
      }

      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        }
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || defaultMessage,
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: defaultMessage,
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
