// CSV service - implementation coming in Sprint 4

export interface CSVValidationResult {
  valid: boolean
  errors: CSVError[]
  previewData: unknown[]
  totalRows: number
}

export interface CSVError {
  row: number
  matricule?: string
  field?: string
  error: string
  message: string
}

export interface CSVImportResult {
  imported: number
  failed: number
  errors: CSVError[]
  successfulUsers: unknown[]
}

export class CSVService {
  async downloadTemplate(): Promise<Blob> {
    throw new Error(
      'CSVService.downloadTemplate - implementation coming in Sprint 4'
    )
  }

  async validateCSV(_file: File): Promise<CSVValidationResult> {
    throw new Error(
      'CSVService.validateCSV - implementation coming in Sprint 4'
    )
  }

  async importUsers(_file: File): Promise<CSVImportResult> {
    throw new Error(
      'CSVService.importUsers - implementation coming in Sprint 4'
    )
  }
}

export const csvService = new CSVService()
