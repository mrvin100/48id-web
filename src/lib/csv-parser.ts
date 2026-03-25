// CSV parsing utilities - implementation coming in Sprint 4

import { User } from '@/types/auth.types'
import { CSVValidationResult, CSVError } from '@/types/csv.types'

// ── Matricule validation (E-BE-01 contract) ───────────────────────────────────

const MATRICULE_FORMAT = /^K48-B[0-9]+-[0-9]+$/

/**
 * Validates a matricule against the K48-B{n}-{seq} format and optional batch.
 * Error messages match the backend exactly (MatriculeValidator.java).
 *
 * @returns null if valid, error string if invalid
 */
export function validateMatricule(
  matricule: string,
  batch?: string
): string | null {
  if (!MATRICULE_FORMAT.test(matricule)) {
    return `Matricule '${matricule}' does not match required format K48-B{n}-{seq}`
  }
  if (batch) {
    const expectedPrefix = `K48-${batch}-`
    if (!matricule.startsWith(expectedPrefix)) {
      const actualPrefix = matricule.substring(0, matricule.lastIndexOf('-'))
      return `Matricule prefix '${actualPrefix}' does not match batch '${batch}'`
    }
  }
  return null
}

/**
 * Returns a helper text string showing expected matricule examples for a given batch.
 * Used by form inputs to guide the user before submission.
 */
export function getMatriculeHelperText(batch: string): string {
  if (!batch)
    return 'Expected format: K48-B{n}-{seq} (e.g. K48-B1-1, K48-B1-12)'
  return `Expected format: K48-${batch}-1, K48-${batch}-12, …`
}

// ── CSV parsing stubs ─────────────────────────────────────────────────────────

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
    _userData: Record<string, unknown>,
    _rowNumber: number
  ): CSVError[] {
    // User validation logic will be implemented in Sprint 4
    console.log('CSVParser.validateUser - implementation coming in Sprint 4')
    return []
  }
}

export class CSVFormatter {
  static format(_users: User[]): string {
    // CSV formatting logic will be implemented in Sprint 4
    console.log('CSVFormatter.format - implementation coming in Sprint 4')
    return ''
  }

  static generateTemplate(): string {
    // Template generation logic will be implemented in Sprint 4
    console.log(
      'CSVFormatter.generateTemplate - implementation coming in Sprint 4'
    )
    return 'matricule,email,name,phone,batch,specialization\n'
  }
}

export const csvParser = new CSVParser()
export const csvFormatter = CSVFormatter
