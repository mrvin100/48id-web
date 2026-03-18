'use client'

/**
 * Provisioning Page Component
 *
 * CSV bulk import interface for user provisioning.
 * Provides template download, file upload, preview, and import results.
 *
 * Requirements: WEB-06-01, WEB-06-02, WEB-06-03
 */

import { useState } from 'react'
import { PageHeader } from '@/components/global'
import { CsvDropzone, type CsvPreviewRow } from './csv-dropzone'
import { ImportResultSummary } from './import-result-summary'
import { useProvisioning, useDownloadTemplate } from '@/hooks/use-provisioning'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Upload, AlertCircle } from 'lucide-react'

export function ProvisioningModule() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([])

  const { importUsers, isImporting, importData, importError } =
    useProvisioning()
  const downloadTemplate = useDownloadTemplate()

  const handleFileSelect = (file: File, preview: CsvPreviewRow[]) => {
    setSelectedFile(file)
    setPreviewRows(preview)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewRows([])
  }

  const handleImport = async () => {
    if (!selectedFile) return

    const errorRows = previewRows.filter(r => r.hasError)
    if (errorRows.length > 0) {
      toast.warning('Please fix the errors before importing')
      return
    }

    try {
      await importUsers(selectedFile)
      toast.success('Import completed successfully')
    } catch (_error) {
      toast.error('Import failed')
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate.mutateAsync()
      toast.success('Template downloaded')
    } catch (_error) {
      toast.error('Failed to download template')
    }
  }

  const errorCount = previewRows.filter(r => r.hasError).length
  const successCount = previewRows.length - errorCount

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Provisioning"
        description="Bulk import users via CSV file"
      />

      {/* Download Template Card */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Download Template</CardTitle>
          <CardDescription>
            Get the official CSV template with the required format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDownloadTemplate}
            disabled={downloadTemplate.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {downloadTemplate.isPending
              ? 'Downloading...'
              : 'Download Template'}
          </Button>
        </CardContent>
      </Card>

      {/* Upload CSV Card */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Upload CSV</CardTitle>
          <CardDescription>
            Upload your completed CSV file for preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CsvDropzone
            onFileSelect={handleFileSelect}
            onClear={handleClear}
            selectedFile={selectedFile}
          />
        </CardContent>
      </Card>

      {/* Import Button */}
      {selectedFile && previewRows.length > 0 && errorCount === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Import Users</CardTitle>
            <CardDescription>Review and confirm the import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are about to import {successCount} users. This action will
                create user accounts and send activation emails.
              </AlertDescription>
            </Alert>

            {isImporting && (
              <div className="space-y-2">
                <Progress className="animate-pulse" />
                <p className="text-muted-foreground text-center text-sm">
                  Importing users... Please wait
                </p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={isImporting || errorCount > 0}
              className="w-full"
              size="lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : `Import ${successCount} Users`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importData && (
        <ImportResultSummary
          result={importData}
          onSuccess={() => {
            handleClear()
          }}
        />
      )}

      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Import failed: {importError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
