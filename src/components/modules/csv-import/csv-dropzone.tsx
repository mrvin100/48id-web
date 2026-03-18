'use client'

/**
 * CSV Dropzone Component
 *
 * File drop zone for CSV import with drag-and-drop support.
 * Includes client-side preview using Papa Parse.
 *
 * Requirements: WEB-06-02
 */

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CsvDropzoneProps {
  onFileSelect: (file: File, preview: CsvPreviewRow[]) => void
  onClear: () => void
  selectedFile: File | null
}

export interface CsvPreviewRow {
  rowNumber: number
  matricule: string
  email: string
  name: string
  phone: string
  batch: string
  specialization: string
  hasError?: boolean
  errorMessage?: string
}

const EXPECTED_HEADERS = [
  'matricule',
  'email',
  'name',
  'phone',
  'batch',
  'specialization',
]

export function CsvDropzone({
  onFileSelect,
  onClear,
  selectedFile,
}: CsvDropzoneProps) {
  const [preview, setPreview] = useState<CsvPreviewRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const validateRow = (
    row: string[],
    rowNumber: number
  ): { row: CsvPreviewRow; hasError: boolean; errorMessage?: string } => {
    const matricule = row[0]?.trim() || ''
    const email = row[1]?.trim() || ''
    const name = row[2]?.trim() || ''
    const phone = row[3]?.trim() || ''
    const batch = row[4]?.trim() || ''
    const specialization = row[5]?.trim() || ''

    // Check required fields
    if (!matricule) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Missing matricule',
      }
    }
    if (!email) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Missing email',
      }
    }
    if (!name) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Missing name',
      }
    }
    if (!phone) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Missing phone',
      }
    }
    if (!batch) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Missing batch',
      }
    }
    if (!specialization) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Missing specialization',
      }
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) {
      return {
        row: {
          rowNumber,
          matricule,
          email,
          name,
          phone,
          batch,
          specialization,
        },
        hasError: true,
        errorMessage: 'Invalid email format',
      }
    }

    return {
      row: {
        rowNumber,
        matricule,
        email,
        name,
        phone,
        batch,
        specialization,
      },
      hasError: false,
    }
  }

  const processCsv = useCallback(
    (file: File) => {
      setParseError(null)

      Papa.parse(file, {
        complete: results => {
          const firstRow = results.data[0]
          if (!firstRow || !Array.isArray(firstRow)) {
            setParseError('Invalid CSV format')
            return
          }

          const headers = firstRow.map((h: string) =>
            String(h).trim().toLowerCase()
          )

          // Validate headers
          if (!headers || headers.length !== EXPECTED_HEADERS.length) {
            setParseError(
              `Invalid CSV header. Expected: ${EXPECTED_HEADERS.join(', ')}`
            )
            return
          }

          const headerMismatch = EXPECTED_HEADERS.some(
            (h, i) => headers[i] !== h
          )
          if (headerMismatch) {
            setParseError(
              `Invalid CSV header. Expected: ${EXPECTED_HEADERS.join(', ')}`
            )
            return
          }

          // Parse and validate rows
          const previewRows: CsvPreviewRow[] = []
          let hasDuplicates = false
          const matricules = new Set<string>()

          for (let i = 1; i < results.data.length; i++) {
            const row: unknown = results.data[i]
            if (!Array.isArray(row) || (row.length === 1 && !row[0])) continue

            const {
              row: parsedRow,
              hasError,
              errorMessage: _errorMessage,
            } = validateRow(row as string[], i + 1)

            // Check for duplicate matricules
            if (!hasError && matricules.has(parsedRow.matricule)) {
              hasDuplicates = true
              parsedRow.hasError = true
              parsedRow.errorMessage = 'Duplicate matricule'
            }

            matricules.add(parsedRow.matricule)
            previewRows.push(parsedRow)
          }

          if (hasDuplicates) {
            setParseError('Warning: Duplicate matricules detected')
          }

          setPreview(previewRows)
          onFileSelect(file, previewRows)
        },
        error: () => {
          setParseError('Failed to parse CSV file')
        },
      })
    },
    [onFileSelect]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      if (rejectedFiles.length > 0) {
        setParseError('Invalid file type. Only CSV files are accepted.')
        return
      }

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      if (file) {
        processCsv(file)
      }
    },
    [processCsv]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  const handleClear = () => {
    setPreview([])
    setParseError(null)
    onClear()
  }

  if (selectedFile && preview.length > 0) {
    const errorCount = preview.filter(r => r.hasError).length
    const successCount = preview.length - errorCount

    return (
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-sm">
                  {preview.length} rows • {successCount} valid • {errorCount}{' '}
                  errors
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{parseError}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant={errorCount > 0 ? 'secondary' : 'default'}>
              {errorCount > 0 ? (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errorCount} errors
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Ready to import
                </>
              )}
            </Badge>
          </div>

          {/* Preview Table - First 5 rows */}
          <div className="max-h-64 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="border-b p-2 text-left">Row</th>
                  <th className="border-b p-2 text-left">Matricule</th>
                  <th className="border-b p-2 text-left">Email</th>
                  <th className="border-b p-2 text-left">Name</th>
                  <th className="border-b p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map(row => (
                  <tr
                    key={row.rowNumber}
                    className={row.hasError ? 'bg-yellow-50' : ''}
                  >
                    <td className="border-b p-2 font-mono text-xs">
                      {row.rowNumber}
                    </td>
                    <td className="border-b p-2">{row.matricule}</td>
                    <td className="border-b p-2">{row.email}</td>
                    <td className="border-b p-2">{row.name}</td>
                    <td className="border-b p-2">
                      {row.hasError ? (
                        <Badge variant="destructive" className="text-xs">
                          {row.errorMessage}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          OK
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.length > 5 && (
            <p className="text-muted-foreground text-center text-sm">
              ...and {preview.length - 5} more rows
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`hover:bg-muted flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragActive ? 'border-primary bg-muted' : ''
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="mb-2 text-lg font-medium">
            {isDragActive
              ? 'Drop the CSV file here'
              : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-muted-foreground text-sm">
            or click to select (CSV files only)
          </p>
          {parseError && (
            <div className="text-destructive mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{parseError}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
