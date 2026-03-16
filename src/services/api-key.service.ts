// API Key service - implementation coming in Sprint 5

export interface APIKey {
  id: string
  applicationName: string
  description: string
  createdAt: string
  lastUsedAt?: string
  createdBy: string
}

export interface CreateAPIKeyRequest {
  applicationName: string
  description: string
}

export interface APIKeyCreationResponse {
  key: string
  applicationName: string
  createdAt: string
}

export interface APIKeyRotationResponse {
  newKey: string
  rotatedAt: string
}

export class APIKeyService {
  async getAPIKeys(): Promise<APIKey[]> {
    throw new Error(
      'APIKeyService.getAPIKeys - implementation coming in Sprint 5'
    )
  }

  async createAPIKey(
    _request: CreateAPIKeyRequest
  ): Promise<APIKeyCreationResponse> {
    throw new Error(
      'APIKeyService.createAPIKey - implementation coming in Sprint 5'
    )
  }

  async rotateAPIKey(_id: string): Promise<APIKeyRotationResponse> {
    throw new Error(
      'APIKeyService.rotateAPIKey - implementation coming in Sprint 5'
    )
  }

  async revokeAPIKey(_id: string): Promise<void> {
    throw new Error(
      'APIKeyService.revokeAPIKey - implementation coming in Sprint 5'
    )
  }
}

export const apiKeyService = new APIKeyService()
