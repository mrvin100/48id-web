/**
 * API Keys API Layer
 *
 * API functions for API key management operations.
 * Handles CRUD operations for API keys.
 */

import { apiClient } from './client'

// Types
export interface ApiKey {
  id: string
  name: string
  description?: string
  keyPrefix: string
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
}

export interface CreateApiKeyRequest {
  name: string
  description?: string
}

export interface CreateApiKeyResponse {
  id: string
  name: string
  description?: string
  key: string
  keyPrefix: string
  createdAt: string
}

export interface RotateApiKeyResponse {
  id: string
  name: string
  key: string
  keyPrefix: string
  createdAt: string
}

// API Functions
export const apiKeysApi = {
  /**
   * Get list of API keys
   */
  getApiKeys: async (): Promise<ApiKey[]> => {
    return apiClient.get('admin/api-keys').json<ApiKey[]>()
  },

  /**
   * Create new API key
   */
  createApiKey: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    return apiClient.post('admin/api-keys', { json: { applicationName: data.name, description: data.description } }).json<CreateApiKeyResponse>()
  },

  /**
   * Rotate API key
   */
  rotateApiKey: async (id: string): Promise<RotateApiKeyResponse> => {
    return apiClient.post(`admin/api-keys/${id}/rotate`).json<RotateApiKeyResponse>()
  },

  /**
   * Revoke API key
   */
  revokeApiKey: async (id: string): Promise<void> => {
    return apiClient.delete(`admin/api-keys/${id}`).json<void>()
  },
}

export default apiKeysApi
