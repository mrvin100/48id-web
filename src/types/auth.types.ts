/**
 * Authentication Types and Interfaces
 *
 * This file defines all TypeScript interfaces, types, and enums
 * related to authentication functionality in the 48ID Admin Portal.
 *
 * Requirements: 1.1, 1.4
 */

// User Status Enum
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
}

// User Role Enum
export enum UserRole {
  ADMIN = 'ADMIN',
  SYSTEM_OPERATOR = 'SYSTEM_OPERATOR',
  STUDENT = 'STUDENT',
}

// Core User Interface
export interface User {
  id: string
  matricule: string
  email: string
  firstName: string
  lastName: string
  status: UserStatus
  role: UserRole
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isEmailVerified: boolean
  profilePicture?: string
}

// Login Credentials Interface
export interface LoginCredentials {
  matricule: string
  password: string
}

// Authentication Response Interface
export interface AuthResponse {
  success: boolean
  user?: User
  message?: string
  expiresAt?: string
}
// Authentication Error Interface
export interface AuthError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

// BFF Request Types
export interface LoginRequest {
  matricule: string
  password: string
  rememberMe?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LogoutRequest {
  // Empty for now, may include session info later
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RefreshTokenRequest {
  // Handled via HttpOnly cookies, no body needed
}

// BFF Response Types
export interface LoginResponse {
  success: boolean
  user?: User
  message?: string
  redirectUrl?: string
}

export interface LogoutResponse {
  success: boolean
  message?: string
}

export interface RefreshTokenResponse {
  success: boolean
  user?: User
  expiresAt?: string
  message?: string
}

// Authentication State Interface
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  error: AuthError | null
  lastActivity: number | null
}

// Authentication Context Interface
export interface AuthContextType {
  state: AuthState
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

// Token Payload Interface (for JWT decoding)
export interface TokenPayload {
  sub: string // user ID
  matricule: string
  role: UserRole
  iat: number
  exp: number
  iss: string
}

// Authentication Event Types
export type AuthEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED_ACCESS'

export interface AuthEvent {
  type: AuthEventType
  timestamp: number
  userId?: string
  details?: Record<string, unknown>
}
