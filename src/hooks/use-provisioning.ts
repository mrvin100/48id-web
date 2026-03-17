/**
 * Provisioning Hooks
 *
 * TanStack Query hooks for CSV bulk import operations.
 * Provides template download and file upload functionality.
 */

import { useMutation } from '@tanstack/react-query'
import { provisioningApi, type CsvImportResponse } from '@/lib/api/provisioning'
import { provisioningKeys } from '@/lib/query-keys'

/**
 * Hook to download CSV import template
 */
export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async () => {
      const blob = await provisioningApi.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '48id_import_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })
}

/**
 * Hook to import users from CSV file
 */
export function useImportUsers() {
  return useMutation({
    mutationFn: (file: File) => provisioningApi.importUsers(file),
    onSuccess: (data: CsvImportResponse) => {
      // Invalidate any user lists to refresh the data
      // This will be handled by the component calling useUsers().refetch()
    },
  })
}

/**
 * Composed hook for provisioning operations
 */
export function useProvisioning() {
  const downloadMutation = useDownloadTemplate()
  const importMutation = useImportUsers()

  return {
    // Mutations
    downloadTemplate: downloadMutation.mutate,
    importUsers: importMutation.mutate,

    // Mutation states
    isDownloading: downloadMutation.isPending,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importData: importMutation.data,
  }
}
