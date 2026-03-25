/**
 * Tests for validateMatricule and getMatriculeHelperText
 * Requirements: WEB-S4-FE-04, WEB-S4-FE-05
 */

import { describe, it, expect } from 'vitest'
import { validateMatricule, getMatriculeHelperText } from '@/lib/validations'

describe('validateMatricule', () => {
  it('returns null for valid matricule matching batch', () => {
    expect(validateMatricule('K48-B1-12', 'B1')).toBeNull()
  })

  it('returns null for valid matricule without batch', () => {
    expect(validateMatricule('K48-B2-5')).toBeNull()
  })

  it('returns format error for invalid format', () => {
    const result = validateMatricule('K48-2024-001', 'B1')
    expect(result).toContain('does not match required format')
  })

  it('returns exact backend error message for prefix mismatch', () => {
    expect(validateMatricule('K48-B2-5', 'B1')).toBe(
      "Matricule prefix 'K48-B2' does not match batch 'B1'"
    )
  })

  it('returns error for empty string', () => {
    expect(validateMatricule('')).not.toBeNull()
  })

  it('returns error for lowercase input (format is case-sensitive)', () => {
    expect(validateMatricule('k48-b1-12')).not.toBeNull()
  })

  it('returns error for matricule with surrounding whitespace', () => {
    // validateMatricule does not trim — callers must trim before calling
    expect(validateMatricule(' K48-B1-12 ')).not.toBeNull()
  })
})

describe('getMatriculeHelperText', () => {
  it('returns batch-specific hint when batch is provided', () => {
    const text = getMatriculeHelperText('B1')
    expect(text).toContain('K48-B1-1')
    expect(text).toContain('K48-B1-12')
  })

  it('returns generic hint when batch is empty', () => {
    const text = getMatriculeHelperText('')
    expect(text).toContain('K48-B{n}-{seq}')
  })
})
