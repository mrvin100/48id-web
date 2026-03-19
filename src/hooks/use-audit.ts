/**
 * Audit Hooks
 *
 * TanStack Query hooks for audit log operations.
 * Provides caching and filtering capabilities.
 */

import { useQuery } from '@tanstack/react-query'
import { auditApi, type AuditFilters } from '@/lib/api/audit'
import { auditKeys } from '@/lib/query-keys'

/**
 * Hook to fetch audit log with filters
 */
export function useAuditLog(filters?: AuditFilters) {
  return useQuery({
    queryKey: auditKeys.log(filters),
    queryFn: () => auditApi.getAuditLog(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export default useAuditLog
