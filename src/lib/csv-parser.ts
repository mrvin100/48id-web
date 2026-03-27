// CSV parsing utilities with centralized validation

import { User } from '@/types/auth.types'
import { CSVValidationResult, CSVError } from '@/types/csv.types'
import {
  validateCsvImportRow,
  buildCsvTemplateContent,
} from '@/lib/validations'

// ── CSV parsing utilities ──────────────────────────────────────────────────────

export interface CSVParseOptions {
  delimiter?: string
  quote?: string
  escape?: string
  skipEmptyLines?: boolean
  skipLinesWithError?: boolean
}

export class CSVParser {
  private options: Required<CSVParseOptions>

  constructor(options: CSVParseOptions = {}) {
    this.options = {
      delimiter: ',',
      quote: '"',
      escape: '"',
      skipEmptyLines: true,
      skipLinesWithError: false,
      ...options,
    }
  }

  async parse(_csvContent: string): Promise<CSVValidationResult> {
    // CSV parsing logic will be implemented in Sprint 4
    console.log('CSVParser.parse - implementation coming in Sprint 4')

    return {
      valid: false,
      errors: [],
      previewData: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }

  validateUser(
    userData: Record<string, unknown>,
    rowNumber: number
  ): CSVError[] {
    const errors: CSVError[] = []
    const matricule = String(userData.matricule || '')
    const email = String(userData.email || '')
    const name = String(userData.name || '')
    const phone = String(userData.phone || '')
    const batch = String(userData.batch || '')
    const specialization = String(userData.specialization || '')

    const rowError = validateCsvImportRow({
      matricule,
      email,
      name,
      phone,
      batch,
      specialization,
    })
    if (rowError) {
      errors.push({
        row: rowNumber,
        matricule,
        error: 'INVALID_ROW',
        message: rowError,
        severity: 'error',
      })
    }

    return errors
  }
}

export class CSVFormatter {
  static format(_users: User[]): string {
    // CSV formatting logic will be implemented in Sprint 4
    console.log('CSVFormatter.format - implementation coming in Sprint 4')
    return ''
  }

  static generateTemplate(): string {
    return buildCsvTemplateContent()
  }
}

export const csvParser = new CSVParser()
export const csvFormatter = CSVFormatter
