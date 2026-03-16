// Central utility exports for the 48ID Admin Portal

// Existing utilities
export * from './utils'
export * from './validations'
export * from './api-client'
export * from './query-client'

// New utilities created in this task
export * from './auth'
export * from './csv-parser'
export * from './error-handler'

// Re-export commonly used utilities
export { cn } from './utils'
export { apiClient } from './api-client'
export { queryClient } from './query-client'
export { authConfig } from './auth'
export { csvParser, csvFormatter } from './csv-parser'
export { errorHandler } from './error-handler'

// Form config utilities (avoiding conflicts with validations.ts)
export {
  createFormConfig,
  defaultFormConfig,
  formFieldConfigs,
  validateFormData,
  createFormSubmissionHandler,
  getFieldErrorMessage,
  getFormState,
  formPatterns,
  getFieldAccessibilityProps,
  createFormResetHandler,
} from './form-config'
