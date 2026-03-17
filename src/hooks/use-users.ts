/**
 * Users Hooks
 *
 * TanStack Query hooks for user management operations.
 * Provides CRUD operations with caching and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  usersApi,
  type UserFilters,
  type UpdateUserData,
  type ChangeRoleData,
  type ChangeStatusData,
} from '@/lib/api/users'
import { User } from '@/types/auth.types'

// Query Keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
}

/**
 * Hook to fetch paginated users list with filters
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a specific user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to update user profile
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersApi.updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update the user detail cache
      queryClient.setQueryData(usersKeys.detail(id), updatedUser)

      // Invalidate users lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Hook to change user role
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeRoleData }) =>
      usersApi.changeRole(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update the user detail cache
      queryClient.setQueryData(usersKeys.detail(id), updatedUser)

      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Hook to change user status
 */
export function useChangeUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeStatusData }) =>
      usersApi.changeStatus(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update the user detail cache
      queryClient.setQueryData(usersKeys.detail(id), updatedUser)

      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Hook to force password reset
 */
export function useForcePasswordReset() {
  return useMutation({
    mutationFn: (id: string) => usersApi.forcePasswordReset(id),
  })
}

/**
 * Hook to delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) })

      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Hook to unlock user account
 */
export function useUnlockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersApi.unlockAccount(id),
    onSuccess: (_, id) => {
      // Invalidate user detail to refetch updated status
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })

      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Composed hook for user management operations
 */
export function useUserManagement(filters?: UserFilters) {
  const usersQuery = useUsers(filters)
  const updateMutation = useUpdateUser()
  const changeRoleMutation = useChangeUserRole()
  const changeStatusMutation = useChangeUserStatus()
  const deleteMutation = useDeleteUser()
  const unlockMutation = useUnlockUser()
  const forceResetMutation = useForcePasswordReset()

  return {
    // Data
    users: usersQuery.data?.content ?? [],
    totalUsers: usersQuery.data?.totalElements ?? 0,
    totalPages: usersQuery.data?.totalPages ?? 0,
    currentPage: usersQuery.data?.number ?? 0,

    // Loading states
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    // Mutations
    updateUser: updateMutation.mutate,
    changeRole: changeRoleMutation.mutate,
    changeStatus: changeStatusMutation.mutate,
    deleteUser: deleteMutation.mutate,
    unlockUser: unlockMutation.mutate,
    forcePasswordReset: forceResetMutation.mutate,

    // Mutation states
    isUpdating: updateMutation.isPending,
    isChangingRole: changeRoleMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUnlocking: unlockMutation.isPending,
    isResettingPassword: forceResetMutation.isPending,

    // Refetch
    refetch: usersQuery.refetch,
  }
}
