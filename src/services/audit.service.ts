// Audit service - implementation coming in Sprint 5

import { PaginatedResponse } from '@/types/api.types'

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
  async getAuditLogs(
    _params: AuditParams
  ): Promise<PaginatedResponse<AuditLog>> {
    throw new Error(
      'AuditService.getAuditLogs - implementation coming in Sprint 5'
    )
  }

  async exportAuditLogs(_params: AuditParams): Promise<Blob> {
    throw new Error(
      'AuditService.exportAuditLogs - implementation coming in Sprint 5'
    )
  }
}

export const auditService = new AuditService()
