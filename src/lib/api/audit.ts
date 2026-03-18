/**
 * Audit API Layer
 *
 * API functions for audit log operations.
 * Handles fetching and filtering audit events.
 */

import { apiClient } from './client'

// Types
export interface AuditEvent {
  id: string
  eventType: string
  userId: string
  userName: string
  userMatricule: string
  ipAddress: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface AuditFilters {
  eventType?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
  sort?: string
}

export interface BackendAuditEvent {
  id: string
  userId: string
  action: string
  ipAddress: string
  userAgent: string
  timestamp: string
}

export interface PaginatedAuditEventsResponse {
  content: AuditEvent[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// API Functions
export const auditApi = {
  /**
   * Get paginated audit log with optional filters
   */
  getAuditLog: async (filters?: AuditFilters): Promise<PaginatedAuditEventsResponse> => {
    const searchParams = new URLSearchParams()

    if (filters?.userId) searchParams.set('userId', filters.userId)
    if (filters?.eventType) searchParams.set('eventType', filters.eventType)
    if (filters?.dateFrom) searchParams.set('from', filters.dateFrom)
    if (filters?.dateTo) searchParams.set('to', filters.dateTo)
    if (filters?.page !== undefined) searchParams.set('page', filters.page.toString())
    if (filters?.size !== undefined) searchParams.set('size', filters.size.toString())
    if (filters?.sort) searchParams.set('sort', filters.sort)

    const response = await apiClient.get('admin/audit-log', { searchParams }).json<{
      content: BackendAuditEvent[]
      totalElements: number
      totalPages: number
      size: number
      number: number
      first: boolean
      last: boolean
    }>()

    // Transform backend response to frontend format
    return {
      ...response,
      content: response.content.map(event => ({
        id: event.id,
        eventType: event.action,
        userId: event.userId,
        userName: 'System', // Backend doesn't provide user name yet
        userMatricule: 'N/A', // Backend doesn't provide matricule yet
        ipAddress: event.ipAddress,
        timestamp: event.timestamp,
        metadata: event.userAgent ? { userAgent: event.userAgent } : undefined,
      })),
    }
  },
}

export default auditApi
