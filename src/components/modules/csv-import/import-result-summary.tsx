'use client'

/**
 * Import Result Summary Component
 *
 * Displays the results of a CSV import operation.
 * Shows success count, error count, and detailed error table.
 *
 * Requirements: WEB-06-03
 */

import { CsvImportResponse } from '@/lib/api/provisioning'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface ImportResultSummaryProps {
  result: CsvImportResponse
  onSuccess: () => void
}

export function ImportResultSummary({
  result,
  onSuccess,
}: ImportResultSummaryProps) {
  const { imported, failed, errors } = result

  const isSuccess = failed === 0 && imported > 0
  const isPartialSuccess = imported > 0 && failed > 0
  const isCompleteFailure = imported === 0 && (failed > 0 || errors.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Alert */}
        {isSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>Success!</strong> {imported} users imported successfully.
            </AlertDescription>
          </Alert>
        )}

        {isPartialSuccess && (
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>Partial Success:</strong> {imported} imported, {failed} failed.
            </AlertDescription>
          </Alert>
        )}

        {isCompleteFailure && (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>Import Failed:</strong> {errors[0]?.error ?? 'All rows failed.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="text-2xl font-bold">{imported + failed}</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-muted-foreground text-sm">Imported</p>
            <p className="text-2xl font-bold text-green-600">{imported}</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-muted-foreground text-sm">Failed</p>
            <p className="text-destructive text-2xl font-bold">{failed}</p>
          </div>
        </div>

        {/* Error Table */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Failed Rows</h4>
            <div className="max-h-96 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((error, index) => (
                    <TableRow key={index} className="bg-destructive/5">
                      <TableCell className="font-mono">{error.row}</TableCell>
                      <TableCell>{error.matricule || 'N/A'}</TableCell>
                      <TableCell>{error.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button onClick={onSuccess} className="w-full">
          Import Another File
        </Button>
      </CardContent>
    </Card>
  )
}
