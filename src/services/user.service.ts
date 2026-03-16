// User management service - implementation coming in Sprint 3

import { PaginatedResponse } from '@/types/api.types'

export interface UserListParams {
  page?: number
  size?: number
  search?: string
  status?: string
}

export class UserService {
  async getUsers(_params: UserListParams): Promise<PaginatedResponse<unknown>> {
    throw new Error('UserService.getUsers - implementation coming in Sprint 3')
  }

  async getUser(_id: string): Promise<unknown> {
    throw new Error('UserService.getUser - implementation coming in Sprint 3')
  }

  async updateUser(_id: string, _data: unknown): Promise<unknown> {
    throw new Error(
      'UserService.updateUser - implementation coming in Sprint 3'
    )
  }

  async changeUserStatus(_id: string, _status: string): Promise<void> {
    throw new Error(
      'UserService.changeUserStatus - implementation coming in Sprint 3'
    )
  }

  async changeUserRole(_id: string, _role: string): Promise<void> {
    throw new Error(
      'UserService.changeUserRole - implementation coming in Sprint 3'
    )
  }

  async resetPassword(_id: string): Promise<void> {
    throw new Error(
      'UserService.resetPassword - implementation coming in Sprint 3'
    )
  }
}

export const userService = new UserService()
