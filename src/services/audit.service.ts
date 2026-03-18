/**
 * Audit Service Layer
 *
 * This service handles all audit log operations including
 * fetching audit logs with filtering and pagination.
 */

import ky, { HTTPError } from 'ky'
import { PaginatedResponse } from '@/types/api.types'
import { config } from '@/lib/env'

export interface AuditParams {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  page?: number
  size?: number
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  ipAddress: string
  userAgent: string
  timestamp: string
}

export class AuditService {
  private httpClient: typeof ky

  constructor() {
    this.httpClient = ky.create({
      prefixUrl: config.frontend.apiBase,
      timeout: config.backend.timeout,
      retry: {
        limit: config.backend.retryLimit,
        methods: ['get'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      hooks: {
        beforeError: [
          error => {
            console.error('AuditService HTTP Error:', error)
            return error
          },
        ],
      },
    })
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(
    params: AuditParams = {}
  ): Promise<PaginatedResponse<AuditLog>> {
    try {
      const searchParams = new URLSearchParams()

      if (params.page !== undefined) {
        searchParams.set('page', params.page.toString())
      }
      if (params.size !== undefined) {
        searchParams.set('size', params.size.toString())
      }
      if (params.userId) {
        searchParams.set('userId', params.userId)
      }
      if (params.action) {
        searchParams.set('eventType', params.action)
      }
      if (params.startDate) {
        searchParams.set('from', params.startDate)
      }
      if (params.endDate) {
        searchParams.set('to', params.endDate)
      }

      const response = await this.httpClient
        .get(`admin/audit-log?${searchParams.toString()}`)
        .json<PaginatedResponse<AuditLog>>()

      return response
    } catch (error) {
      console.error('Get audit logs error:', error)
      throw this.handleAuditError(error, 'Failed to fetch audit logs')
    }
  }

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(params: AuditParams): Promise<Blob> {
    try {
      const searchParams = new URLSearchParams()

      if (params.userId) {
        searchParams.set('userId', params.userId)
      }
      if (params.action) {
        searchParams.set('eventType', params.action)
      }
      if (params.startDate) {
        searchParams.set('from', params.startDate)
      }
      if (params.endDate) {
        searchParams.set('to', params.endDate)
      }

      const response = await this.httpClient.get(
        `admin/audit-log/export?${searchParams.toString()}`,
        {
          headers: {
            Accept: 'text/csv',
          },
        }
      )

      return await response.blob()
    } catch (error) {
      console.error('Export audit logs error:', error)
      throw this.handleAuditError(error, 'Failed to export audit logs')
    }
  }

  /**
   * Handle and transform audit service errors
   */
  private handleAuditError(error: unknown, defaultMessage: string): Error {
    if (error instanceof HTTPError) {
      const status = error.response.status

      switch (status) {
        case 400:
          return new Error('Invalid request parameters')
        case 401:
          return new Error('Authentication required')
        case 403:
          return new Error('Access denied. Admin privileges required.')
        case 404:
          return new Error('Audit logs not found')
        case 429:
          return new Error(
            'Too many requests. Please wait before trying again.'
          )
        case 503:
          return new Error('Audit service is temporarily unavailable')
        default:
          return new Error(`Server error (${status}). Please try again.`)
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return new Error('Request timed out. Please try again.')
      }

      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        return new Error('Network error. Please check your connection.')
      }

      return new Error(error.message || defaultMessage)
    }

    return new Error(defaultMessage)
  }
}

export const auditService = new AuditService()
