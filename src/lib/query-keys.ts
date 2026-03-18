/**
 * Centralized Query Keys
 *
 * Hierarchical query key structure for TanStack Query.
 * Provides consistent cache management across the application.
 */

import type { UserFilters } from './api/users'
import type { AuditFilters } from './api/audit'

/**
 * Query key factory for users
 */
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
}

/**
 * Query key factory for dashboard
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  loginActivity: () => [...dashboardKeys.all, 'login-activity'] as const,
  recentActivity: () => [...dashboardKeys.all, 'recent-activity'] as const,
}

/**
 * Query key factory for authentication
 */
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
}

/**
 * Query key factory for audit logs
 */
export const auditKeys = {
  all: ['audit'] as const,
  logs: () => [...auditKeys.all, 'logs'] as const,
  log: (filters?: AuditFilters) =>
    [...auditKeys.logs(), filters] as const,
}

/**
 * Query key factory for API keys
 */
export const apiKeysKeys = {
  all: ['api-keys'] as const,
  lists: () => [...apiKeysKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...apiKeysKeys.lists(), filters] as const,
  details: () => [...apiKeysKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeysKeys.details(), id] as const,
}

/**
 * Query key factory for provisioning
 */
export const provisioningKeys = {
  all: ['provisioning'] as const,
  importResult: () => [...provisioningKeys.all, 'import-result'] as const,
}
