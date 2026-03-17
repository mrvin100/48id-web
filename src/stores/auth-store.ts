/**
 * Authentication Store using Zustand
 *
 * This store manages authentication state including user data, loading states,
 * and error handling. It integrates with the AuthService for all auth operations.
 *
 * Storage Strategy:
 * - User data persisted in sessionStorage (survives page refresh, cleared on tab close)
 * - JWT tokens stored in HttpOnly cookies (secure, not accessible to JavaScript)
 * - Session automatically validated on rehydration
 *
 * Requirements: 1.1, 1.3
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  User,
  AuthState,
  AuthError,
  LoginCredentials,
  AuthResponse,
} from '@/types/auth.types'
import { config } from '@/lib/env'
import { authService } from '@/services/auth.service'

/**
 * Extended auth state interface with actions
 */
interface AuthStoreState extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: AuthError | null) => void
  clearError: () => void
  updateLastActivity: () => void

  // Computed getters
  isAdmin: () => boolean
  isSystemOperator: () => boolean
  hasAdminAccess: () => boolean
  getUserDisplayName: () => string
  getSessionTimeRemaining: () => number | null
}

/**
 * Session timeout configuration (in milliseconds)
 */
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

/**
 * Authentication store implementation using Zustand
 *
 * Features:
 * - Immer for immutable updates
 * - DevTools integration for debugging
 * - Persistent storage for user session (excluding sensitive data)
 * - Type-safe state management
 * - Automatic session timeout handling
 * - Integration with AuthService
 */
export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: null,

        // Actions
        login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
          set(state => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await authService.login(credentials)

            set(state => {
              state.user = response.user || null
              state.isAuthenticated = !!response.user
              state.isLoading = false
              state.error = null
              state.lastActivity = Date.now()
            })

            return response
          } catch (error) {
            const authError: AuthError =
              error instanceof Error
                ? { code: 'LOGIN_ERROR', message: error.message }
                : { code: 'UNKNOWN_ERROR', message: 'Login failed' }

            set(state => {
              state.isLoading = false
              state.error = authError
              state.user = null
              state.isAuthenticated = false
            })

            return {
              success: false,
              message: authError.message,
            }
          }
        },

        logout: async (): Promise<void> => {
          set(state => {
            state.isLoading = true
          })

          try {
            await authService.logout()
          } catch (error) {
            console.warn('Logout service error:', error)
            // Continue with local logout regardless of service error
          }

          set(state => {
            state.user = null
            state.isAuthenticated = false
            state.isLoading = false
            state.error = null
            state.lastActivity = null
          })
        },

        refreshUser: async (): Promise<void> => {
          // Don't show loading for background refresh
          try {
            const user = await authService.getCurrentUser()

            set(state => {
              if (user) {
                state.user = user
                state.isAuthenticated = true
                state.lastActivity = Date.now()
                state.error = null
              } else {
                state.user = null
                state.isAuthenticated = false
                state.lastActivity = null
              }
            })
          } catch (error) {
            console.warn('User refresh error:', error)

            set(state => {
              state.user = null
              state.isAuthenticated = false
              state.lastActivity = null
            })
          }
        },

        setUser: (user: User | null) =>
          set(state => {
            state.user = user
            state.isAuthenticated = !!user
            state.lastActivity = user ? Date.now() : null
            state.error = null
          }),

        setLoading: (loading: boolean) =>
          set(state => {
            state.isLoading = loading
          }),

        setError: (error: AuthError | null) =>
          set(state => {
            state.error = error
            if (error) {
              state.isLoading = false
            }
          }),

        clearError: () =>
          set(state => {
            state.error = null
          }),

        updateLastActivity: () =>
          set(state => {
            if (state.isAuthenticated) {
              state.lastActivity = Date.now()
            }
          }),

        // Computed getters
        isAdmin: () => {
          const { user } = get()
          return user?.role === 'ADMIN'
        },

        isSystemOperator: () => {
          const { user } = get()
          return user?.role === 'SYSTEM_OPERATOR'
        },

        hasAdminAccess: () => {
          const { user } = get()
          return user?.role === 'ADMIN' || user?.role === 'SYSTEM_OPERATOR'
        },

        getUserDisplayName: () => {
          const { user } = get()
          if (!user) return ''
          return `${user.firstName} ${user.lastName}`.trim() || user.matricule
        },

        getSessionTimeRemaining: () => {
          const { lastActivity, isAuthenticated } = get()
          if (!isAuthenticated || !lastActivity) return null

          const elapsed = Date.now() - lastActivity
          const remaining = SESSION_TIMEOUT - elapsed
          return Math.max(0, remaining)
        },
      })),
      {
        name: '48id-auth-storage',
        // Use sessionStorage for better security (cleared on tab close)
        storage: {
          getItem: (name: string) => {
            const str = sessionStorage.getItem(name)
            if (!str) return null
            return JSON.parse(str)
          },
          setItem: (name: string, value: any) => {
            sessionStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name: string) => {
            sessionStorage.removeItem(name)
          },
        } as any,
        // Only persist non-sensitive user data
        partialize: (state) => ({
          user: state.user
            ? {
                id: state.user.id,
                matricule: state.user.matricule,
                email: state.user.email,
                name:
                  state.user.name ||
                  `${state.user.firstName} ${state.user.lastName}`,
                phone: state.user.phone,
                batch: state.user.batch,
                specialization: state.user.specialization,
                status: state.user.status,
                roles: state.user.roles,
                profileCompleted:
                  state.user.profileCompleted ??
                  state.user.isEmailVerified ??
                  false,
                lastLoginAt: state.user.lastLoginAt,
                createdAt: state.user.createdAt,
                updatedAt: state.user.updatedAt,
                firstName: state.user.firstName,
                lastName: state.user.lastName,
                role: state.user.role,
                isEmailVerified: state.user.isEmailVerified,
                profilePicture: state.user.profilePicture,
              }
            : null,
          isAuthenticated: state.isAuthenticated,
          lastActivity: state.lastActivity,
        }),
        // Rehydrate authentication state on app load
        onRehydrateStorage: () => state => {
          if (state) {
            // Reset loading and error states on rehydration
            state.isLoading = false
            state.error = null

            // Check if session has expired
            if (state.lastActivity && state.isAuthenticated) {
              const elapsed = Date.now() - state.lastActivity
              if (elapsed > SESSION_TIMEOUT) {
                // Session expired, clear auth state
                state.user = null
                state.isAuthenticated = false
                state.lastActivity = null
                // Clear sessionStorage
                sessionStorage.removeItem('48id-auth-storage')
              }
            }
          }
        },
      },
    ),
    {
      name: 'auth-store',
      enabled: config.app.enableDebug,
    }
  )
)

/**
 * Selectors for common auth state patterns
 * These provide optimized access to specific parts of the auth state
 */
export const authSelectors = {
  user: (state: AuthStoreState) => state.user,
  isAuthenticated: (state: AuthStoreState) => state.isAuthenticated,
  isLoading: (state: AuthStoreState) => state.isLoading,
  error: (state: AuthStoreState) => state.error,
  isAdmin: (state: AuthStoreState) => state.isAdmin(),
  isSystemOperator: (state: AuthStoreState) => state.isSystemOperator(),
  hasAdminAccess: (state: AuthStoreState) => state.hasAdminAccess(),
  userDisplayName: (state: AuthStoreState) => state.getUserDisplayName(),
  userEmail: (state: AuthStoreState) => state.user?.email ?? '',
  userMatricule: (state: AuthStoreState) => state.user?.matricule ?? '',
  sessionTimeRemaining: (state: AuthStoreState) =>
    state.getSessionTimeRemaining(),
  lastActivity: (state: AuthStoreState) => state.lastActivity,
}

/**
 * Hook for session timeout management
 */
export const useSessionTimeout = () => {
  const {
    getSessionTimeRemaining,
    isAuthenticated,
    logout,
    updateLastActivity,
  } = useAuthStore()

  return {
    getTimeRemaining: getSessionTimeRemaining,
    isSessionActive: isAuthenticated,
    extendSession: updateLastActivity,
    endSession: logout,
    isWarningTime: () => {
      const remaining = getSessionTimeRemaining()
      return remaining !== null && remaining <= SESSION_WARNING_TIME
    },
  }
}
