// User management types - will be expanded in Sprint 3

import { UserStatus, UserRole } from './auth.types'

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  batch?: string
  specialization?: string
}

export interface ChangeStatusRequest {
  status: UserStatus
  reason?: string
}

export interface ChangeRoleRequest {
  roles: UserRole[]
}

export interface UserListParams {
  page?: number
  size?: number
  search?: string
  status?: UserStatus
  role?: UserRole
  batch?: string
  specialization?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface UserFilters {
  status?: UserStatus[]
  roles?: UserRole[]
  batches?: string[]
  specializations?: string[]
  dateRange?: {
    start: string
    end: string
  }
}
