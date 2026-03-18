'use client'

/**
 * Audit Event Badge Component
 *
 * Color-coded badge for audit event types.
 *
 * Requirements: WEB-08-02
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AuditEventBadgeProps {
  eventType: string
  className?: string
}

const eventVariantMap: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  LOGIN_SUCCESS: 'default',
  LOGIN_FAILURE: 'destructive',
  LOGOUT: 'secondary',
  ACCOUNT_LOCKED: 'destructive',
  ACCOUNT_UNLOCKED: 'default',
  PASSWORD_CHANGED: 'secondary',
  PASSWORD_RESET_REQUESTED: 'secondary',
  PASSWORD_RESET_COMPLETED: 'default',
  ROLE_CHANGED: 'outline',
  ACCOUNT_SUSPENDED: 'destructive',
  ACCOUNT_REACTIVATED: 'default',
  CSV_IMPORT: 'outline',
  API_KEY_CREATED: 'outline',
  API_KEY_ROTATED: 'outline',
  API_KEY_REVOKED: 'destructive',
}

const eventColorMap: Record<string, string> = {
  LOGIN_SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  LOGIN_FAILURE: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  ACCOUNT_LOCKED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  ACCOUNT_SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  API_KEY_REVOKED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  PASSWORD_CHANGED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  PASSWORD_RESET_REQUESTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  ROLE_CHANGED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  CSV_IMPORT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  API_KEY_CREATED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

export function AuditEventBadge({ eventType, className }: AuditEventBadgeProps) {
  const variant = eventVariantMap[eventType] ?? 'outline'
  const colorClass = eventColorMap[eventType] ?? ''

  return (
    <Badge
      variant={variant}
      className={cn(colorClass, className)}
    >
      {eventType.replace(/_/g, ' ')}
    </Badge>
  )
}
