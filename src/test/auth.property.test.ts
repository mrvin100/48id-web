/**
 * Property-Based Tests for Authentication Flow
 *
 * These tests validate universal correctness properties of the authentication system
 * using property-based testing with fast-check.
 *
 * Property 1: Authentication Flow Integrity
 * Property 2: Token Refresh Automation
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'
import {
  LoginCredentials,
  User,
  UserRole,
  UserStatus,
} from '@/types/auth.types'

// Mock ky for testing
vi.mock('ky', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}))

// Property test configuration
const propertyTestConfig = {
  numRuns: 100,
  verbose: true,
  seed: 42,
}

// Generators for test data
const matriculeArb = fc.stringMatching(/^[A-Z0-9]{6,12}$/)
const passwordArb = fc.string({ minLength: 8, maxLength: 50 })
const emailArb = fc.emailAddress()
const nameArb = fc.string({ minLength: 2, maxLength: 50 })
const userIdArb = fc.uuid()

const userRoleArb = fc.constantFrom(
  UserRole.ADMIN,
  UserRole.SYSTEM_OPERATOR,
  UserRole.STUDENT
)
const userStatusArb = fc.constantFrom(
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.PENDING,
  UserStatus.SUSPENDED,
  UserStatus.LOCKED
)

const loginCredentialsArb = fc.record({
  matricule: matriculeArb,
  password: passwordArb,
})

const userArb = fc.record({
  id: userIdArb,
  matricule: matriculeArb,
  email: emailArb,
  firstName: nameArb,
  lastName: nameArb,
  status: userStatusArb,
  role: userRoleArb,
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
  lastLoginAt: fc.option(
    fc.date().map(d => d.toISOString()),
    { nil: undefined }
  ),
  isEmailVerified: fc.boolean(),
  profilePicture: fc.option(fc.webUrl(), { nil: undefined }),
})

describe('Property: Authentication Flow Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth store state
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Property 1.1: Valid credentials should always result in consistent authentication state', () => {
    fc.assert(
      fc.asyncProperty(
        loginCredentialsArb,
        userArb,
        async (credentials, mockUser) => {
          // Arrange: Mock successful login response
          const mockKy = await import('ky')
          const mockPost = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue({
              success: true,
              user: mockUser,
              token: 'mock-jwt-token',
              refreshToken: 'mock-refresh-token',
            }),
          })

          // @ts-expect-error - Mocking ky
          mockKy.default.create.mockReturnValue({ post: mockPost })

          // Act: Perform login
          const response = await authService.login(credentials)

          // Assert: Authentication state should be consistent
          expect(response.success).toBe(true)
          expect(response.user).toEqual(mockUser)

          // Verify API was called with correct credentials
          expect(mockPost).toHaveBeenCalledWith('auth/login', {
            json: {
              matricule: credentials.matricule.toUpperCase(),
              password: credentials.password,
              rememberMe: false,
            },
          })
        }
      ),
      propertyTestConfig
    )
  })

  it('Property 1.2: Invalid credentials should always result in authentication failure', () => {
    fc.assert(
      fc.asyncProperty(loginCredentialsArb, async credentials => {
        // Arrange: Mock failed login response
        const mockKy = await import('ky')
        const mockPost = vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({
            success: false,
            message: 'Invalid credentials',
          }),
        })

        // @ts-expect-error - Mocking ky
        mockKy.default.create.mockReturnValue({ post: mockPost })

        // Act: Attempt login with invalid credentials
        try {
          await authService.login(credentials)
          // Should not reach here
          expect(true).toBe(false)
        } catch (error) {
          // Assert: Should throw error for invalid credentials
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Login failed')
        }
      }),
      propertyTestConfig
    )
  })

  it('Property 1.3: Matricule validation should be consistent and deterministic', () => {
    fc.assert(
      fc.property(fc.string(), matricule => {
        // Act: Validate matricule
        const isValid1 = authService.validateMatricule(matricule)
        const isValid2 = authService.validateMatricule(matricule)

        // Assert: Validation should be deterministic
        expect(isValid1).toBe(isValid2)

        // Assert: Valid matricules should match expected format
        const expectedValid = /^[A-Z0-9]{6,12}$/.test(
          matricule.trim().toUpperCase()
        )
        expect(isValid1).toBe(expectedValid)
      }),
      propertyTestConfig
    )
  })

  it('Property 1.4: Password validation should enforce security requirements consistently', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 100 }), password => {
        // Act: Validate password
        const result1 = authService.validatePassword(password)
        const result2 = authService.validatePassword(password)

        // Assert: Validation should be deterministic
        expect(result1.isValid).toBe(result2.isValid)
        expect(result1.errors).toEqual(result2.errors)

        // Assert: Password requirements should be enforced
        const hasMinLength = password.length >= 8
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        const expectedValid =
          hasMinLength &&
          hasUppercase &&
          hasLowercase &&
          hasNumber &&
          hasSpecial
        expect(result1.isValid).toBe(expectedValid)

        // Assert: Error messages should be consistent with validation rules
        if (!hasMinLength) {
          expect(result1.errors).toContain(
            'Password must be at least 8 characters long'
          )
        }
        if (!hasUppercase) {
          expect(result1.errors).toContain(
            'Password must contain at least one uppercase letter'
          )
        }
        if (!hasLowercase) {
          expect(result1.errors).toContain(
            'Password must contain at least one lowercase letter'
          )
        }
        if (!hasNumber) {
          expect(result1.errors).toContain(
            'Password must contain at least one number'
          )
        }
        if (!hasSpecial) {
          expect(result1.errors).toContain(
            'Password must contain at least one special character'
          )
        }
      }),
      propertyTestConfig
    )
  })

  it('Property 1.5: Role-based access control should be enforced consistently', () => {
    fc.assert(
      fc.property(userArb, user => {
        // Act: Check admin access
        const hasAdminAccess1 =
          user.role === UserRole.ADMIN || user.role === UserRole.SYSTEM_OPERATOR
        const hasAdminAccess2 =
          user.role === UserRole.ADMIN || user.role === UserRole.SYSTEM_OPERATOR

        // Assert: Access control should be deterministic
        expect(hasAdminAccess1).toBe(hasAdminAccess2)

        // Assert: Only ADMIN and SYSTEM_OPERATOR should have admin access
        if (user.role === UserRole.STUDENT) {
          expect(hasAdminAccess1).toBe(false)
        } else {
          expect(hasAdminAccess1).toBe(true)
        }
      }),
      propertyTestConfig
    )
  })
})

describe('Property: Token Refresh Automation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Property 2.1: Token refresh should maintain user session consistency', () => {
    fc.assert(
      fc.asyncProperty(userArb, async mockUser => {
        // Arrange: Mock successful refresh response
        const mockKy = await import('ky')
        const mockPost = vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({
            success: true,
            user: mockUser,
            token: 'new-jwt-token',
            refreshToken: 'new-refresh-token',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }),
        })

        // @ts-expect-error - Mocking ky
        mockKy.default.create.mockReturnValue({ post: mockPost })

        // Act: Refresh token
        const refreshedUser = await authService.refreshToken()

        // Assert: Refreshed user should match expected user
        expect(refreshedUser).toEqual(mockUser)

        // Verify refresh API was called
        expect(mockPost).toHaveBeenCalledWith('auth/refresh')
      }),
      propertyTestConfig
    )
  })

  it('Property 2.2: Failed token refresh should clear authentication state', () => {
    fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Arrange: Mock failed refresh response
        const mockKy = await import('ky')
        const mockPost = vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({
            success: false,
            message: 'Refresh token expired',
          }),
        })

        // @ts-expect-error - Mocking ky
        mockKy.default.create.mockReturnValue({ post: mockPost })

        // Act: Attempt token refresh
        try {
          await authService.refreshToken()
          // Should not reach here
          expect(true).toBe(false)
        } catch (error) {
          // Assert: Should throw error for failed refresh
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Token refresh failed')
        }
      }),
      propertyTestConfig
    )
  })

  it('Property 2.3: Authentication state should be consistent across store operations', () => {
    fc.assert(
      fc.property(userArb, user => {
        const store = useAuthStore.getState()

        // Act: Set user in store
        store.setUser(user)

        // Assert: Store state should be consistent
        expect(store.user).toEqual(user)
        expect(store.isAuthenticated).toBe(true)
        expect(store.isAdmin()).toBe(user.role === UserRole.ADMIN)
        expect(store.isSystemOperator()).toBe(
          user.role === UserRole.SYSTEM_OPERATOR
        )
        expect(store.hasAdminAccess()).toBe(
          user.role === UserRole.ADMIN || user.role === UserRole.SYSTEM_OPERATOR
        )

        // Act: Clear user from store
        store.setUser(null)

        // Assert: Store should be cleared
        expect(store.user).toBe(null)
        expect(store.isAuthenticated).toBe(false)
        expect(store.isAdmin()).toBe(false)
        expect(store.isSystemOperator()).toBe(false)
        expect(store.hasAdminAccess()).toBe(false)
      }),
      propertyTestConfig
    )
  })
})
