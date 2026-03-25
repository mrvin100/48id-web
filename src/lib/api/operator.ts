/**
 * Operator API Layer
 *
 * Typed API functions for the operator module.
 * All calls go through BFF routes — never directly to backend.
 */

import { apiClient } from './client'
import type { PaginatedAuditEventsResponse } from './audit'

// ── Types ──────────────────────────────────────────────────────────────────

export interface OperatorUser {
  id: string
  matricule: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  batch?: string
  status: string
  roles: string[]
  createdAt: string
}

export interface PaginatedOperatorUsersResponse {
  content: OperatorUser[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ApiKeyCall {
  timestamp: string
  ip: string
  endpoint: string
  method: string
  totalInWindow: number
}

export interface MemberAction {
  userId: string
  matricule: string
  action: string
  endpoint: string
  timestamp: string
}

export interface OperatorTrafficResponse {
  apiKeyCalls: ApiKeyCall[]
  memberActions: MemberAction[]
  generatedAt: string
}

export interface ApiKeyMetadata {
  id: string
  appName: string
  createdAt: string
  lastUsedAt?: string
  memberRole: 'OWNER' | 'COLLABORATOR'
}

export interface ApiKeyCreatedResponse extends ApiKeyMetadata {
  rawKey: string
}

// ── API Functions ──────────────────────────────────────────────────────────

export const operatorApi = {
  getUsers: (
    params?: { page?: number; size?: number }
  ): Promise<PaginatedOperatorUsersResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined)
      searchParams.set('page', params.page.toString())
    if (params?.size !== undefined)
      searchParams.set('size', params.size.toString())
    return apiClient
      .get('operator/users', { searchParams })
      .json<PaginatedOperatorUsersResponse>()
  },

  getAuditLog: (params?: {
    eventType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    size?: number
  }): Promise<PaginatedAuditEventsResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.eventType) searchParams.set('eventType', params.eventType)
    if (params?.dateFrom) searchParams.set('from', params.dateFrom)
    if (params?.dateTo) searchParams.set('to', params.dateTo)
    if (params?.page !== undefined)
      searchParams.set('page', params.page.toString())
    if (params?.size !== undefined)
      searchParams.set('size', params.size.toString())
    return apiClient
      .get('operator/audit-log', { searchParams })
      .json<PaginatedAuditEventsResponse>()
  },

  getTraffic: (): Promise<OperatorTrafficResponse> =>
    apiClient.get('operator/traffic').json<OperatorTrafficResponse>(),

  getApiKey: (): Promise<ApiKeyMetadata | null> =>
    apiClient
      .get('operator/api-keys')
      .json<ApiKeyMetadata>()
      .catch(() => null),

  createApiKey: (): Promise<ApiKeyCreatedResponse> =>
    apiClient.post('operator/api-keys').json<ApiKeyCreatedResponse>(),

  rotateApiKey: (): Promise<ApiKeyCreatedResponse> =>
    apiClient
      .put('operator/api-keys', { searchParams: { action: 'rotate' } })
      .json<ApiKeyCreatedResponse>(),

  deleteApiKey: (): Promise<void> =>
    apiClient.delete('operator/api-keys').then(() => undefined),
}

export default operatorApi
