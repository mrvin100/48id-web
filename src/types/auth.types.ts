// Authentication types - will be expanded in Sprint 1

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

export interface LoginCredentials {
  matricule: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  requiresPasswordChange: boolean
  user: User
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
