/**
 * Provisioning API Layer
 *
 * API functions for CSV bulk import operations.
 * Handles template download, file upload, and import results.
 */

import { apiClient } from './client'

// Request/Response Types
export interface CsvImportResult {
  successCount: number
  errorCount: number
  errors: CsvRowError[]
}

export interface CsvRowError {
  rowNumber: number
  matricule: string
  errorCode: string
  message?: string
}

export interface CsvImportResponse {
  successCount: number
  errorCount: number
  errors: CsvRowError[]
}

// API Functions
export const provisioningApi = {
  /**
   * Download CSV import template
   */
  downloadTemplate: async (): Promise<Blob> => {
    return apiClient.get('admin/users/import/template').blob()
  },

  /**
   * Import users from CSV file
   */
  importUsers: async (file: File): Promise<CsvImportResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post('admin/users/import', {
        body: formData,
      })
      .json<CsvImportResponse>()
  },
}

export default provisioningApi
