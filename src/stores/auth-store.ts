import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * User interface matching the backend User model
 */
export interface User {
  id: string
  matricule: string
  email: string
  name: string
  phone?: string
  batch: string
  specialization: string
  status: UserStatus
  roles: UserRole[]
  profileCompleted: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

/**
 * Authentication store state interface
 */
interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  clearError: () => void

  // Computed getters
  isAdmin: () => boolean
  hasRole: (role: UserRole) => boolean
}

/**
 * Authentication store implementation using Zustand
 *
 * Features:
 * - Immer for immutable updates
 * - DevTools integration for debugging
 * - Persistent storage for user session (excluding sensitive data)
 * - Type-safe state management
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: user =>
          set(state => {
            state.user = user
            state.isAuthenticated = !!user
            state.error = null
          }),

        setLoading: loading =>
          set(state => {
            state.isLoading = loading
          }),

        setError: error =>
          set(state => {
            state.error = error
            state.isLoading = false
          }),

        login: user =>
          set(state => {
            state.user = user
            state.isAuthenticated = true
            state.isLoading = false
            state.error = null
          }),

        logout: () =>
          set(state => {
            state.user = null
            state.isAuthenticated = false
            state.isLoading = false
            state.error = null
          }),

        updateUser: updates =>
          set(state => {
            if (state.user) {
              Object.assign(state.user, updates)
            }
          }),

        clearError: () =>
          set(state => {
            state.error = null
          }),

        // Computed getters
        isAdmin: () => {
          const { user } = get()
          return user?.roles.includes(UserRole.ADMIN) ?? false
        },

        hasRole: role => {
          const { user } = get()
          return user?.roles.includes(role) ?? false
        },
      })),
      {
        name: '48id-auth-storage',
        // Only persist non-sensitive user data
        partialize: state => ({
          user: state.user
            ? {
                id: state.user.id,
                matricule: state.user.matricule,
                email: state.user.email,
                name: state.user.name,
                roles: state.user.roles,
                status: state.user.status,
              }
            : null,
          isAuthenticated: state.isAuthenticated,
        }),
        // Rehydrate authentication state on app load
        onRehydrateStorage: () => state => {
          if (state) {
            // Reset loading and error states on rehydration
            state.isLoading = false
            state.error = null
          }
        },
      }
    ),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

/**
 * Selectors for common auth state patterns
 * These provide optimized access to specific parts of the auth state
 */
export const authSelectors = {
  user: (state: AuthState) => state.user,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  error: (state: AuthState) => state.error,
  isAdmin: (state: AuthState) => state.isAdmin(),
  userRoles: (state: AuthState) => state.user?.roles ?? [],
  userName: (state: AuthState) => state.user?.name ?? '',
  userEmail: (state: AuthState) => state.user?.email ?? '',
}
