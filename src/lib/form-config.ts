import { UseFormProps, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/**
 * React Hook Form configuration utilities for the 48ID Admin Portal
 *
 * This module provides:
 * - Pre-configured form options with Zod integration
 * - Common form patterns and utilities
 * - Type-safe form configuration
 * - Consistent error handling
 */

/**
 * Default form configuration with optimized settings
 */
export const defaultFormConfig: UseFormProps = {
  mode: 'onBlur', // Validate on blur for better UX
  reValidateMode: 'onChange', // Re-validate on change after first validation
  shouldFocusError: true, // Focus first error field on submit
  shouldUnregister: false, // Keep field values when unmounting
  shouldUseNativeValidation: false, // Use React Hook Form validation
  criteriaMode: 'firstError', // Show first error only
  delayError: 300, // Debounce validation by 300ms
}

/**
 * Create form configuration with Zod schema
 */
export function createFormConfig<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  options: Partial<UseFormProps<T>> = {}
): UseFormProps<T> {
  return {
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    shouldUnregister: false,
    shouldUseNativeValidation: false,
    criteriaMode: 'firstError',
    delayError: 300,
    // @ts-expect-error - Zod v4 compatibility issue with resolver types
    resolver: zodResolver(schema),
    ...options,
  }
}

/**
 * Form field configuration types
 */
export interface FormFieldConfig {
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number'
}

/**
 * Common form field configurations
 */
export const formFieldConfigs = {
  // Authentication fields
  matricule: {
    label: 'Matricule',
    placeholder: 'K48-YYYY-XXX',
    description: 'Your K48 student matricule',
    required: true,
    autoComplete: 'username',
    type: 'text' as const,
  },

  password: {
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
    autoComplete: 'current-password',
    type: 'password' as const,
  },

  newPassword: {
    label: 'New Password',
    placeholder: 'Enter new password',
    description:
      'Must contain at least 8 characters with uppercase, lowercase, number, and special character',
    required: true,
    autoComplete: 'new-password',
    type: 'password' as const,
  },

  confirmPassword: {
    label: 'Confirm Password',
    placeholder: 'Confirm new password',
    required: true,
    autoComplete: 'new-password',
    type: 'password' as const,
  },

  // User management fields
  email: {
    label: 'Email',
    placeholder: 'user@k48.fr',
    description: 'Must be a valid K48 email address',
    required: true,
    autoComplete: 'email',
    type: 'email' as const,
  },

  name: {
    label: 'Full Name',
    placeholder: 'Enter full name',
    required: true,
    autoComplete: 'name',
    type: 'text' as const,
  },

  phone: {
    label: 'Phone Number',
    placeholder: '+33 1 23 45 67 89',
    description: 'Optional French phone number',
    required: false,
    autoComplete: 'tel',
    type: 'tel' as const,
  },

  batch: {
    label: 'Batch',
    placeholder: '2024',
    description: 'Graduation year',
    required: true,
    type: 'text' as const,
  },

  specialization: {
    label: 'Specialization',
    placeholder: 'Software Engineering',
    required: true,
    type: 'text' as const,
  },

  // API key fields
  applicationName: {
    label: 'Application Name',
    placeholder: 'My Application',
    description: 'Name of the application using this API key',
    required: true,
    type: 'text' as const,
  },

  description: {
    label: 'Description',
    placeholder: 'Describe the purpose of this API key',
    description: 'Brief description of how this API key will be used',
    required: true,
    type: 'text' as const,
  },

  // Search fields
  search: {
    label: 'Search',
    placeholder: 'Search...',
    type: 'search' as const,
  },
} as const

/**
 * Form validation helpers
 */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validate form data against schema
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult {
  const result = schema.safeParse(data)

  if (result.success) {
    return { isValid: true, errors: {} }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((error: z.ZodIssue) => {
    const path = error.path.join('.')
    errors[path] = error.message
  })

  return { isValid: false, errors }
}

/**
 * Form submission helpers
 */
export interface FormSubmissionOptions {
  onSuccess?: (data: unknown) => void
  onError?: (error: unknown) => void
  showSuccessMessage?: boolean
  showErrorMessage?: boolean
  resetOnSuccess?: boolean
}

/**
 * Create form submission handler
 */
export function createFormSubmissionHandler<T extends FieldValues>(
  submitFn: (data: T) => Promise<unknown>,
  options: FormSubmissionOptions = {}
) {
  return async (data: T, { reset }: { reset: () => void }) => {
    try {
      const result = await submitFn(data)

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      if (options.resetOnSuccess) {
        reset()
      }

      return result
    } catch (error) {
      if (options.onError) {
        options.onError(error)
      }
      throw error
    }
  }
}

/**
 * Form field error helpers
 */
export function getFieldErrorMessage<T extends FieldValues>(
  errors: Record<string, { message?: string }>,
  fieldName: Path<T>
): string | undefined {
  const error = errors[fieldName]
  return error?.message
}

export function hasFieldError<T extends FieldValues>(
  errors: Record<string, unknown>,
  fieldName: Path<T>
): boolean {
  return !!errors[fieldName]
}

/**
 * Form state helpers
 */
export interface FormState {
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  errors: Record<string, unknown>
}

export function getFormState(formState: {
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  errors: Record<string, unknown>
}): FormState {
  return {
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    errors: formState.errors,
  }
}

/**
 * Common form patterns
 */
export const formPatterns = {
  // Debounced validation
  debouncedValidation: {
    mode: 'onChange' as const,
    delayError: 500,
  },

  // Immediate validation
  immediateValidation: {
    mode: 'onChange' as const,
    delayError: 0,
  },

  // Submit-only validation
  submitOnlyValidation: {
    mode: 'onSubmit' as const,
    reValidateMode: 'onSubmit' as const,
  },

  // Blur validation (default)
  blurValidation: {
    mode: 'onBlur' as const,
    reValidateMode: 'onChange' as const,
  },
} as const

/**
 * Form accessibility helpers
 */
export function getFieldAccessibilityProps(
  fieldName: string,
  config: FormFieldConfig,
  hasError: boolean
) {
  return {
    'aria-label': config.label,
    'aria-required': config.required,
    'aria-invalid': hasError,
    'aria-describedby': config.description
      ? `${fieldName}-description`
      : undefined,
  }
}

/**
 * Form reset helpers
 */
export function createFormResetHandler(
  reset: () => void,
  onReset?: () => void
) {
  return () => {
    reset()
    if (onReset) {
      onReset()
    }
  }
}
