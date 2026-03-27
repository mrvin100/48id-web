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
  /** membership record id (used for remove operations) */
  id: string
  userId: string
  memberRole: 'OWNER' | 'COLLABORATOR'
  status: 'ACTIVE' | 'PENDING' | 'REMOVED'
  createdAt: string
}

/**
 * A 48ID user who has authenticated externally via this operator account's API key.
 * These are the "consumers" of the operator's platform — NOT account members.
 */
export interface ApiConsumer {
  userId: string
  matricule: string
  email: string
  name?: string
  batch?: string
  status: string
  totalCalls: number
  firstSeen: string
  lastSeen: string
}

export interface PaginatedApiConsumersResponse {
  content: ApiConsumer[]
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

  createAccount: (body: {
    name: string
    description?: string
  }): Promise<MyOperatorAccount> =>
    apiClient
      .post('operator/accounts', { json: body })
      .json<MyOperatorAccount>(),

  deleteAccount: (accountId: string): Promise<void> =>
    apiClient.delete(`operator/accounts/${accountId}`).then(() => undefined),

  // Members of an operator account (OWNER + COLLABORATORs)
  getMembers: (accountId: string): Promise<OperatorMember[]> =>
    apiClient
      .get(`operator/accounts/${accountId}/members`)
      .json<OperatorMember[]>(),

  inviteMember: (accountId: string, matricule: string): Promise<void> =>
    apiClient
      .post(`operator/accounts/${accountId}/invite`, { json: { matricule } })
      .then(() => undefined),

  removeMember: (accountId: string, memberId: string): Promise<void> =>
    apiClient
      .delete(`operator/accounts/${accountId}/members/${memberId}`)
      .then(() => undefined),

  // Accept operator invite (public — no auth cookie needed)
  acceptOperatorInvite: (token: string): Promise<void> =>
    apiClient
      .post('auth/accept-operator-invite', { json: { token } })
      .then(() => undefined),

  // Users — API consumers who authenticated via this operator's API key
  getUsers: (
    accountId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedApiConsumersResponse> => {
    const searchParams = new URLSearchParams({ accountId })
    if (params?.page !== undefined)
      searchParams.set('page', params.page.toString())
    if (params?.size !== undefined)
      searchParams.set('size', params.size.toString())
    return apiClient
      .get('operator/users', { searchParams })
      .json<PaginatedApiConsumersResponse>()
  },

  // Audit log (account-scoped)
  getAuditLog: (
    accountId: string,
    params?: {
      eventType?: string
      dateFrom?: string
      dateTo?: string
      page?: number
      size?: number
    }
  ): Promise<PaginatedAuditEventsResponse> => {
    const searchParams = new URLSearchParams({ accountId })
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

  // Traffic (scoped to operator account)
  getTraffic: (accountId: string): Promise<OperatorTrafficResponse> =>
    apiClient
      .get('operator/traffic', { searchParams: { accountId } })
      .json<OperatorTrafficResponse>(),

  // API Keys (account-scoped)
  getApiKey: (accountId: string): Promise<ApiKeyMetadata | null> =>
    apiClient
      .get('operator/api-keys', { searchParams: { accountId } })
      .json<ApiKeyMetadata>()
      .catch(() => null),

  createApiKey: (
    accountId: string,
    body: { applicationName: string; description?: string }
  ): Promise<ApiKeyCreatedResponse> =>
    apiClient
      .post('operator/api-keys', { json: body, searchParams: { accountId } })
      .json<ApiKeyCreatedResponse>(),

  rotateApiKey: (accountId: string): Promise<ApiKeyCreatedResponse> =>
    apiClient
      .put('operator/api-keys/rotate', { searchParams: { accountId } })
      .json<ApiKeyCreatedResponse>(),

  deleteApiKey: (accountId: string): Promise<void> =>
    apiClient
      .delete('operator/api-keys', { searchParams: { accountId } })
      .then(() => undefined),
}

export default operatorApi
