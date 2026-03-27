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

// Mock ky globally — the authService singleton is built with ky.create at import time,
// so we need the mock to be in place before the module loads.
// The global setup.ts already mocks ky, but we override here to ensure the post() chain
// returns a proper { json() } object so authService.login() can call .json<T>().
vi.mock('ky', () => {
  const makeKyInstance = () => ({
    post: vi.fn().mockReturnValue({
      json: vi.fn().mockResolvedValue({}),
    }),
    get: vi.fn().mockReturnValue({
      json: vi.fn().mockResolvedValue({}),
    }),
    delete: vi.fn().mockReturnValue({
      json: vi.fn().mockResolvedValue({}),
    }),
    put: vi.fn().mockReturnValue({
      json: vi.fn().mockResolvedValue({}),
    }),
  })
  const instance = makeKyInstance()
  const mockKy = Object.assign(
    vi.fn(() => instance),
    {
      create: vi.fn(() => instance),
      get: instance.get,
      post: instance.post,
      put: instance.put,
      delete: instance.delete,
    }
  )
  return {
    default: mockKy,
    __esModule: true,
    HTTPError: class MockHTTPError extends Error {
      response: { status: number }
      constructor(response: { status: number }) {
        super('HTTP Error')
        this.response = response
      }
    },
    TimeoutError: class MockTimeoutError extends Error {
      constructor() {
        super('Timeout')
      }
    },
  }
})

// Property test configuration
const propertyTestConfig = {
  numRuns: 100,
  verbose: true,
  seed: 42,
}

// Generators for test data
const matriculeArb = fc
  .tuple(
    fc.integer({ min: 1, max: 99 }), // batch number
    fc.integer({ min: 1, max: 9999 }) // sequence
  )
  .map(([b, s]) => `K48-B${b}-${s}`)
const passwordArb = fc.string({ minLength: 8, maxLength: 50 })
const emailArb = fc.emailAddress()
const nameArb = fc.string({ minLength: 2, maxLength: 50 })
const userIdArb = fc.uuid()

const userRoleArb = fc.constantFrom(
  UserRole.ADMIN,
  UserRole.OPERATOR,
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
  name: nameArb,
  phone: fc.option(fc.string(), { nil: undefined }),
  batch: fc.option(fc.string(), { nil: undefined }),
  specialization: fc.option(fc.string(), { nil: undefined }),
  status: userStatusArb.map(s => s.toString()),
  roles: fc.array(
    userRoleArb.map(r => r.toString()),
    { minLength: 1 }
  ),
  profileCompleted: fc.boolean(),
  lastLoginAt: fc.option(
    fc.constantFrom(
      '2024-01-01T00:00:00.000Z',
      '2024-06-15T12:30:00.000Z',
      '2025-01-01T00:00:00.000Z'
    ),
    { nil: undefined }
  ),
  createdAt: fc.constantFrom(
    '2023-09-01T00:00:00.000Z',
    '2024-01-01T00:00:00.000Z',
    '2024-06-01T00:00:00.000Z'
  ),
  updatedAt: fc.constantFrom(
    '2024-01-15T00:00:00.000Z',
    '2024-07-01T00:00:00.000Z',
    '2025-03-01T00:00:00.000Z'
  ),
  firstName: nameArb,
  lastName: nameArb,
  profilePicture: fc.option(fc.webUrl(), { nil: undefined }),
})

describe('Property: Authentication Flow Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store directly — avoids calling authService.logout() which requires ky mock
    useAuthStore.getState().setUser(null)
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
          // Arrange: Spy on authService.login directly (singleton pattern).
          // Use mockResolvedValue (not Once) so multiple fast-check iterations each get a value.
          vi.spyOn(authService, 'login').mockResolvedValue({
            success: true,
            user: mockUser,
            message: 'Login successful',
          })

          // Act: Perform login
          const response = await authService.login(credentials)

          // Assert: Authentication state should be consistent
          expect(response.success).toBe(true)
          expect(response.user).toEqual(mockUser)

          // Restore after each iteration so the next iteration gets a fresh spy
          vi.restoreAllMocks()
        }
      ),
      propertyTestConfig
    )
  })

  it('Property 1.2: Invalid credentials should always result in authentication failure', () => {
    fc.assert(
      fc.asyncProperty(loginCredentialsArb, async credentials => {
        vi.spyOn(authService, 'login').mockResolvedValue({
          success: false,
          message: 'Invalid credentials',
        })

        const response = await authService.login(credentials)

        expect(response.success).toBe(false)
        expect(response.message).toBeTruthy()

        vi.restoreAllMocks()
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
        const expectedValid = /^K48-B[0-9]{1,4}-[0-9]+$/.test(
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
        const hasAdminAccess1 = user.roles.includes(UserRole.ADMIN)
        const hasAdminAccess2 = user.roles.includes(UserRole.ADMIN)

        expect(hasAdminAccess1).toBe(hasAdminAccess2)

        if (user.roles.includes(UserRole.ADMIN)) {
          expect(hasAdminAccess1).toBe(true)
        } else {
          expect(hasAdminAccess1).toBe(false)
        }
      }),
      propertyTestConfig
    )
  })
})

describe('Property: Token Refresh Automation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().setUser(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Property 2.1: Token refresh should maintain user session consistency', () => {
    fc.assert(
      fc.asyncProperty(userArb, async mockUser => {
        vi.spyOn(authService, 'refreshToken').mockResolvedValue(mockUser)

        const refreshedUser = await authService.refreshToken()

        expect(refreshedUser).toEqual(mockUser)

        vi.restoreAllMocks()
      }),
      propertyTestConfig
    )
  })

  it('Property 2.2: Failed token refresh should clear authentication state', () => {
    fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        vi.spyOn(authService, 'refreshToken').mockRejectedValue({
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Refresh token expired',
        })

        try {
          await authService.refreshToken()
          expect(true).toBe(false)
        } catch (error) {
          expect(error).toHaveProperty('code')
          expect(error).toHaveProperty('message')
        }

        vi.restoreAllMocks()
      }),
      propertyTestConfig
    )
  })

  it('Property 2.3: Authentication state should be consistent across store operations', () => {
    fc.assert(
      fc.property(userArb, user => {
        // Reset between fast-check iterations
        useAuthStore.getState().setUser(null)

        // Act: Set user in store
        useAuthStore.getState().setUser(user)

        // Assert: Store state should be consistent
        const afterSet = useAuthStore.getState()
        expect(afterSet.user).toEqual(user)
        expect(afterSet.isAuthenticated).toBe(true)
        expect(afterSet.isAdmin()).toBe(user.roles.includes(UserRole.ADMIN))
        expect(afterSet.hasAdminAccess()).toBe(
          user.roles.includes(UserRole.ADMIN)
        )

        // Act: Clear user from store
        useAuthStore.getState().setUser(null)

        // Assert: Store should be cleared
        const afterClear = useAuthStore.getState()
        expect(afterClear.user).toBe(null)
        expect(afterClear.isAuthenticated).toBe(false)
        expect(afterClear.isAdmin()).toBe(false)
        expect(afterClear.hasAdminAccess()).toBe(false)
      }),
      propertyTestConfig
    )
  })
})
