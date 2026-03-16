// Audit types - will be expanded in Sprint 5

export interface AuditLog {
  id: string
  userId: string
  userMatricule: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  ipAddress: string
  userAgent: string
  timestamp: string
  details?: Record<string, unknown>
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL'
}

export interface AuditParams {
  startDate?: string
  endDate?: string
  userId?: string
  userMatricule?: string
  action?: string
  resource?: string
  outcome?: 'SUCCESS' | 'FAILURE' | 'PARTIAL'
  ipAddress?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface AuditFilters {
  dateRange?: {
    start: string
    end: string
  }
  users?: string[]
  actions?: string[]
  resources?: string[]
  outcomes?: ('SUCCESS' | 'FAILURE' | 'PARTIAL')[]
  ipAddresses?: string[]
}

export interface AuditExportParams extends AuditParams {
  format: 'csv' | 'json' | 'xlsx'
  includeDetails?: boolean
}

export interface AuditSummary {
  totalEvents: number
  successfulEvents: number
  failedEvents: number
  partialEvents: number
  uniqueUsers: number
  uniqueActions: number
  dateRange: {
    start: string
    end: string
  }
}
