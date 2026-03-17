/**
 * Users API Layer
 *
 * API functions for user management operations.
 * Handles CRUD operations and data transformations.
 */

import { apiClient } from './client'
import { User } from '@/types/auth.types'

// Request/Response Types
export interface UserFilters {
  status?: string
  batch?: string
  role?: string
  page?: number
  size?: number
  sort?: string
}

export interface PaginatedUsersResponse {
  content: User[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  batch?: string
  specialization?: string
}

export interface ChangeRoleData {
  role: string
}

export interface ChangeStatusData {
  status: string
}

// API Functions
export const usersApi = {
  /**
   * Get paginated list of users with optional filters
   */
  getUsers: async (filters?: UserFilters): Promise<PaginatedUsersResponse> => {
    const searchParams = new URLSearchParams()

    if (filters?.status) searchParams.set('status', filters.status)
    if (filters?.batch) searchParams.set('batch', filters.batch)
    if (filters?.role) searchParams.set('role', filters.role)
    if (filters?.page !== undefined)
      searchParams.set('page', filters.page.toString())
    if (filters?.size !== undefined)
      searchParams.set('size', filters.size.toString())
    if (filters?.sort) searchParams.set('sort', filters.sort)

    const response = await apiClient.get('users', { searchParams }).json<any>()

    // Transform backend response to frontend format
    return {
      ...response,
      content: response.content?.map(transformBackendUser) ?? [],
    }
  },

  /**
   * Get a specific user by ID
   */
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(`users/${id}`).json<any>()
    return transformBackendUser(response)
  },

  /**
   * Update user profile information
   */
  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient
      .put(`users/${id}`, { json: data })
      .json<any>()
    return transformBackendUser(response)
  },

  /**
   * Change user role
   */
  changeRole: async (id: string, data: ChangeRoleData): Promise<User> => {
    const response = await apiClient
      .put(`users/${id}/role`, { json: data })
      .json<any>()
    return transformBackendUser(response)
  },

  /**
   * Change user status
   */
  changeStatus: async (id: string, data: ChangeStatusData): Promise<User> => {
    const response = await apiClient
      .put(`users/${id}/status`, { json: data })
      .json<any>()
    return transformBackendUser(response)
  },

  /**
   * Force password reset for user
   */
  forcePasswordReset: (id: string): Promise<{ message: string }> =>
    apiClient.post(`users/${id}/reset-password`).json<{ message: string }>(),

  /**
   * Soft delete user
   */
  deleteUser: (id: string): Promise<void> =>
    apiClient.delete(`users/${id}`).json<void>(),

  /**
   * Unlock user account
   */
  unlockAccount: (id: string): Promise<void> =>
    apiClient.post(`users/${id}/unlock`).json<void>(),
}

/**
 * Transform backend user data to frontend format
 */
function transformBackendUser(backendUser: any): User {
  return {
    id: backendUser.id,
    matricule: backendUser.matricule,
    email: backendUser.email,
    name: backendUser.name,
    phone: backendUser.phone,
    batch: backendUser.batch,
    specialization: backendUser.specialization,
    status: backendUser.status,
    roles: backendUser.roles,
    profileCompleted: backendUser.profileCompleted,
    lastLoginAt: backendUser.lastLoginAt,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,

    // Computed fields for frontend compatibility
    firstName: backendUser.name?.split(' ')[0] || '',
    lastName: backendUser.name?.split(' ').slice(1).join(' ') || '',
    role: Array.isArray(backendUser.roles)
      ? backendUser.roles[0]
      : backendUser.roles,
    isEmailVerified: backendUser.profileCompleted || false,
    profilePicture: backendUser.profilePicture,
  }
}

export default usersApi
