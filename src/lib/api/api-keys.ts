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

export interface BackendApiKey {
  id: string
  applicationName: string
  description?: string
  createdAt: string
  lastUsedAt?: string
  createdBy: string
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
    const response = await apiClient.get('admin/api-keys').json<BackendApiKey[]>()
    // Transform backend response to frontend format
    return response.map(key => ({
      id: key.id,
      name: key.applicationName,
      description: key.description,
      keyPrefix: 'sk_', // Backend doesn't provide prefix yet
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      isActive: true, // Backend doesn't provide status yet
    }))
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
