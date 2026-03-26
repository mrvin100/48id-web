/**
 * Operator API Layer
 * All calls go through BFF routes — never directly to backend.
 */

import { apiClient } from './client'
import type { PaginatedAuditEventsResponse } from './audit'

// ── Types ──────────────────────────────────────────────────────────────────

export interface MyOperatorAccount {
  id: string
  name: string
  description?: string
  ownedApiKeyId?: string
  createdAt: string
  memberRole: 'OWNER' | 'COLLABORATOR'
  memberStatus: 'ACTIVE' | 'PENDING'
}

export interface OperatorMember {
  id: string
  userId: string
  memberRole: 'OWNER' | 'COLLABORATOR'
  status: 'ACTIVE' | 'PENDING'
  createdAt: string
}

export interface OperatorUser {
  id: string
  matricule: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
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
}

export interface ApiKeyCreatedResponse extends ApiKeyMetadata {
  key: string
}

// ── API Functions ──────────────────────────────────────────────────────────

export const operatorApi = {
  // Accounts
  getAccounts: (): Promise<MyOperatorAccount[]> =>
    apiClient.get('operator/accounts').json<MyOperatorAccount[]>(),

  createAccount: (body: { name: string; description?: string }): Promise<MyOperatorAccount> =>
    apiClient.post('operator/accounts', { json: body }).json<MyOperatorAccount>(),

  deleteAccount: (accountId: string): Promise<void> =>
    apiClient.delete(`operator/accounts/${accountId}`).then(() => undefined),

  inviteMember: (accountId: string, matricule: string): Promise<void> =>
    apiClient
      .post(`operator/accounts/${accountId}/invite`, { json: { matricule } })
      .then(() => undefined),

  removeMember: (accountId: string, memberId: string): Promise<void> =>
    apiClient
      .delete(`operator/accounts/${accountId}/members/${memberId}`)
      .then(() => undefined),

  // Users (account-scoped)
  getUsers: (accountId: string, params?: { page?: number; size?: number }): Promise<PaginatedOperatorUsersResponse> => {
    const searchParams = new URLSearchParams({ accountId })
    if (params?.page !== undefined) searchParams.set('page', params.page.toString())
    if (params?.size !== undefined) searchParams.set('size', params.size.toString())
    return apiClient.get('operator/users', { searchParams }).json<PaginatedOperatorUsersResponse>()
  },

  // Audit log (account-scoped)
  getAuditLog: (accountId: string, params?: {
    eventType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    size?: number
  }): Promise<PaginatedAuditEventsResponse> => {
    const searchParams = new URLSearchParams({ accountId })
    if (params?.eventType) searchParams.set('eventType', params.eventType)
    if (params?.dateFrom) searchParams.set('from', params.dateFrom)
    if (params?.dateTo) searchParams.set('to', params.dateTo)
    if (params?.page !== undefined) searchParams.set('page', params.page.toString())
    if (params?.size !== undefined) searchParams.set('size', params.size.toString())
    return apiClient.get('operator/audit-log', { searchParams }).json<PaginatedAuditEventsResponse>()
  },

  // Traffic (resolved from JWT membership server-side)
  getTraffic: (): Promise<OperatorTrafficResponse> =>
    apiClient.get('operator/traffic').json<OperatorTrafficResponse>(),

  // API Keys (account-scoped)
  getApiKey: (accountId: string): Promise<ApiKeyMetadata | null> =>
    apiClient
      .get('operator/api-keys', { searchParams: { accountId } })
      .json<ApiKeyMetadata>()
      .catch(() => null),

  createApiKey: (accountId: string, body: { applicationName: string; description?: string }): Promise<ApiKeyCreatedResponse> =>
    apiClient
      .post('operator/api-keys', { json: body, searchParams: { accountId } })
      .json<ApiKeyCreatedResponse>(),

  rotateApiKey: (accountId: string): Promise<ApiKeyCreatedResponse> =>
    apiClient
      .put('operator/api-keys', { searchParams: { accountId } })
      .json<ApiKeyCreatedResponse>(),

  deleteApiKey: (accountId: string): Promise<void> =>
    apiClient
      .delete('operator/api-keys', { searchParams: { accountId } })
      .then(() => undefined),
}

export default operatorApi
