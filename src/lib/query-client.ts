import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query client configuration for the 48ID Admin Portal
 *
 * This configuration provides:
 * - Optimized caching strategy with 5-minute stale time
 * - Automatic retry logic with authentication awareness
 * - Background refetch disabled for better UX
 * - Error handling for authentication failures
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Data stays in cache for 10 minutes after becoming unused
      gcTime: 10 * 60 * 1000,
      // Don't refetch on window focus to avoid unnecessary requests
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Custom retry logic
      retry: (failureCount, error) => {
        // Type guard to check if error has status property
        const errorWithStatus = error as { status?: number }
        // Don't retry on authentication errors
        if (
          errorWithStatus?.status === 401 ||
          errorWithStatus?.status === 403
        ) {
          return false
        }
        // Don't retry on client errors (4xx)
        if (
          errorWithStatus?.status &&
          errorWithStatus.status >= 400 &&
          errorWithStatus.status < 500
        ) {
          return false
        }
        // Retry up to 3 times for server errors and network issues
        return failureCount < 3
      },
      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once for network errors
      retry: (failureCount, error) => {
        // Type guard to check if error has status property
        const errorWithStatus = error as { status?: number }
        if (
          errorWithStatus?.status &&
          errorWithStatus.status >= 400 &&
          errorWithStatus.status < 500
        ) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})

/**
 * Query keys factory for consistent cache key management
 *
 * This provides a structured approach to query keys that enables:
 * - Easy cache invalidation
 * - Hierarchical key organization
 * - Type-safe key generation
 */
export const queryKeys = {
  // Authentication queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // User management queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
    health: () => [...queryKeys.dashboard.all, 'health'] as const,
  },

  // Audit log queries
  audit: {
    all: ['audit'] as const,
    logs: (params: Record<string, unknown>) =>
      [...queryKeys.audit.all, 'logs', params] as const,
  },

  // API key queries
  apiKeys: {
    all: ['apiKeys'] as const,
    list: () => [...queryKeys.apiKeys.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.apiKeys.all, 'detail', id] as const,
  },
} as const

/**
 * Utility function to invalidate related queries
 * Useful for optimistic updates and cache management
 */
export const invalidateQueries = {
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  userDetail: (id: string) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) }),
  dashboard: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  audit: () => queryClient.invalidateQueries({ queryKey: queryKeys.audit.all }),
  apiKeys: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all }),
}
