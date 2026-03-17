import { config } from '@/lib/env'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User } from '@/types/auth.types'

/**
 * CSV validation error interface
 */
export interface CSVError {
  row: number
  matricule?: string
  field?: string
  error: string
  message: string
}

/**
 * CSV validation result interface
 */
export interface CSVValidationResult {
  valid: boolean
  errors: CSVError[]
  previewData: User[]
  totalRows: number
}

/**
 * CSV import result interface
 */
export interface CSVImportResult {
  imported: number
  failed: number
  errors: CSVError[]
  successfulUsers: User[]
}

/**
 * CSV import progress interface
 */
export interface CSVImportProgress {
  total: number
  processed: number
  successful: number
  failed: number
  currentUser?: string
  stage: 'validating' | 'importing' | 'complete' | 'error'
}

/**
 * CSV store state interface
 */
interface CSVState {
  // File upload state
  uploadedFile: File | null
  uploadProgress: number

  // Validation state
  validationResult: CSVValidationResult | null
  isValidating: boolean
  validationError: string | null

  // Import state
  importResult: CSVImportResult | null
  importProgress: CSVImportProgress | null
  isImporting: boolean
  importError: string | null

  // UI state
  currentStep: 'upload' | 'validate' | 'preview' | 'import' | 'results'

  // Actions
  setUploadedFile: (file: File | null) => void
  setUploadProgress: (progress: number) => void

  setValidationResult: (result: CSVValidationResult | null) => void
  setValidating: (validating: boolean) => void
  setValidationError: (error: string | null) => void

  setImportResult: (result: CSVImportResult | null) => void
  setImportProgress: (progress: CSVImportProgress | null) => void
  setImporting: (importing: boolean) => void
  setImportError: (error: string | null) => void

  setCurrentStep: (step: CSVState['currentStep']) => void

  resetState: () => void
  resetValidation: () => void
  resetImport: () => void

  // Computed getters
  canProceedToValidation: () => boolean
  canProceedToImport: () => boolean
  hasValidationErrors: () => boolean
  getValidUsersCount: () => number
  getErrorUsersCount: () => number
}

/**
 * CSV store implementation using Zustand
 *
 * Features:
 * - File upload progress tracking
 * - Validation result management
 * - Import progress monitoring
 * - Step-by-step workflow state
 * - Error handling and recovery
 */
export const useCSVStore = create<CSVState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      uploadedFile: null,
      uploadProgress: 0,

      validationResult: null,
      isValidating: false,
      validationError: null,

      importResult: null,
      importProgress: null,
      isImporting: false,
      importError: null,

      currentStep: 'upload',

      // File upload actions
      setUploadedFile: file =>
        set(state => {
          state.uploadedFile = file
          if (!file) {
            state.uploadProgress = 0
            state.currentStep = 'upload'
          }
        }),

      setUploadProgress: progress =>
        set(state => {
          state.uploadProgress = progress
        }),

      // Validation actions
      setValidationResult: result =>
        set(state => {
          state.validationResult = result
          if (result) {
            state.currentStep = 'preview'
          }
        }),

      setValidating: validating =>
        set(state => {
          state.isValidating = validating
          if (validating) {
            state.currentStep = 'validate'
            state.validationError = null
          }
        }),

      setValidationError: error =>
        set(state => {
          state.validationError = error
          state.isValidating = false
          if (error) {
            state.currentStep = 'upload'
          }
        }),

      // Import actions
      setImportResult: result =>
        set(state => {
          state.importResult = result
          if (result) {
            state.currentStep = 'results'
          }
        }),

      setImportProgress: progress =>
        set(state => {
          state.importProgress = progress
          if (progress) {
            state.currentStep = 'import'
          }
        }),

      setImporting: importing =>
        set(state => {
          state.isImporting = importing
          if (importing) {
            state.importError = null
          }
        }),

      setImportError: error =>
        set(state => {
          state.importError = error
          state.isImporting = false
          if (error) {
            state.currentStep = 'preview'
          }
        }),

      // Step management
      setCurrentStep: step =>
        set(state => {
          state.currentStep = step
        }),

      // Reset actions
      resetState: () =>
        set(state => {
          state.uploadedFile = null
          state.uploadProgress = 0
          state.validationResult = null
          state.isValidating = false
          state.validationError = null
          state.importResult = null
          state.importProgress = null
          state.isImporting = false
          state.importError = null
          state.currentStep = 'upload'
        }),

      resetValidation: () =>
        set(state => {
          state.validationResult = null
          state.isValidating = false
          state.validationError = null
          state.currentStep = 'upload'
        }),

      resetImport: () =>
        set(state => {
          state.importResult = null
          state.importProgress = null
          state.isImporting = false
          state.importError = null
          state.currentStep = 'preview'
        }),

      // Computed getters
      canProceedToValidation: () => {
        const { uploadedFile } = get()
        return !!uploadedFile
      },

      canProceedToImport: () => {
        const { validationResult } = get()
        return (
          validationResult?.valid && validationResult.previewData.length > 0
        )
      },

      hasValidationErrors: () => {
        const { validationResult } = get()
        return (validationResult?.errors?.length ?? 0) > 0
      },

      getValidUsersCount: () => {
        const { validationResult } = get()
        return validationResult?.previewData.length ?? 0
      },

      getErrorUsersCount: () => {
        const { validationResult } = get()
        return validationResult?.errors.length ?? 0
      },
    })),
    {
      name: 'csv-store',
      enabled: config.app.enableDebug,
    }
  )
)

/**
 * Selectors for common CSV state patterns
 */
export const csvSelectors = {
  uploadedFile: (state: CSVState) => state.uploadedFile,
  uploadProgress: (state: CSVState) => state.uploadProgress,
  validationResult: (state: CSVState) => state.validationResult,
  isValidating: (state: CSVState) => state.isValidating,
  validationError: (state: CSVState) => state.validationError,
  importResult: (state: CSVState) => state.importResult,
  importProgress: (state: CSVState) => state.importProgress,
  isImporting: (state: CSVState) => state.isImporting,
  importError: (state: CSVState) => state.importError,
  currentStep: (state: CSVState) => state.currentStep,
  canProceedToValidation: (state: CSVState) => state.canProceedToValidation(),
  canProceedToImport: (state: CSVState) => state.canProceedToImport(),
  hasValidationErrors: (state: CSVState) => state.hasValidationErrors(),
  validUsersCount: (state: CSVState) => state.getValidUsersCount(),
  errorUsersCount: (state: CSVState) => state.getErrorUsersCount(),
}
