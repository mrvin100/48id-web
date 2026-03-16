// CSV types - will be expanded in Sprint 4

import { User } from './auth.types'

export interface CSVValidationResult {
  valid: boolean
  errors: CSVError[]
  previewData: User[]
  totalRows: number
  validRows: number
  invalidRows: number
}

export interface CSVError {
  row: number
  matricule?: string
  field?: string
  error: string
  message: string
  severity: 'error' | 'warning'
}

export interface CSVImportResult {
  imported: number
  failed: number
  skipped: number
  errors: CSVError[]
  successfulUsers: User[]
  failedUsers: CSVImportFailure[]
  summary: CSVImportSummary
}

export interface CSVImportFailure {
  row: number
  matricule: string
  errors: string[]
  data: Record<string, unknown>
}

export interface CSVImportSummary {
  totalProcessed: number
  successRate: number
  processingTime: number
  duplicatesFound: number
  validationErrors: number
}

export interface CSVTemplate {
  headers: string[]
  sampleData: Record<string, unknown>[]
  fieldDescriptions: Record<string, string>
  validationRules: Record<string, unknown>
}
