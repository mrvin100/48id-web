/**
 * Provisioning API Layer
 *
 * API functions for CSV bulk import operations.
 * Handles template download, file upload, and import results.
 */

import { apiClient } from './client'

import { HTTPError } from 'ky'

// Matches backend response shape exactly
export interface CsvRowError {
  row: number
  matricule: string
  error: string
}

export interface CsvImportResponse {
  imported: number
  failed: number
  errors: CsvRowError[]
}

export const provisioningApi = {
  downloadTemplate: async (): Promise<Blob> => {
    return apiClient.get('csv/template').blob()
  },

  importUsers: async (file: File): Promise<CsvImportResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      return await apiClient
        .post('admin/users/import', { body: formData })
        .json<CsvImportResponse>()
    } catch (err) {
      if (err instanceof HTTPError) {
        // Extract structured error body from backend 4xx responses
        const body = await err.response.json().catch(() => null)
        if (body) throw Object.assign(err, { responseBody: body })
      }
      throw err
    }
  },
}

export default provisioningApi
