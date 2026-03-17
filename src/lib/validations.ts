import { z } from 'zod'
import { UserRole, UserStatus } from '@/types/auth.types'

/**
 * Zod validation schemas for the 48ID Admin Portal
 *
 * These schemas provide:
 * - Type-safe form validation
 * - Consistent validation rules across the application
 * - Integration with React Hook Form
 * - Server-side validation compatibility
 */

// Common validation patterns
const matriculePattern = /^[A-Z0-9]{6,12}$/
const phonePattern = /^(\+237|0)[1-9](\d{8})$/
const batchPattern = /^(20\d{2})$/

/**
 * Authentication schemas
 */
export const loginSchema = z.object({
  matricule: z.string().min(1, 'Matricule is required'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * User management schemas
 */
export const userSchema = z.object({
  matricule: z
    .string()
    .min(1, 'Matricule is required')
    .regex(matriculePattern, 'Matricule must be in format K48-YYYY-XXX'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .endsWith('@k48.fr', 'Email must be a K48 email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || phonePattern.test(val),
      'Phone number must be a valid French number'
    ),
  batch: z
    .string()
    .min(1, 'Batch is required')
    .regex(batchPattern, 'Batch must be a valid year (20XX)'),
  specialization: z
    .string()
    .min(1, 'Specialization is required')
    .min(2, 'Specialization must be at least 2 characters'),
  status: z.nativeEnum(UserStatus, {
    message: 'Invalid user status',
  }),
  roles: z
    .array(z.nativeEnum(UserRole))
    .min(1, 'At least one role is required')
    .refine(
      roles =>
        roles.includes(UserRole.STUDENT) || roles.includes(UserRole.ADMIN),
      'User must have either STUDENT or ADMIN role'
    ),
})

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().min(1, 'User ID is required'),
})

export const changeUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    message: 'Invalid user status',
  }),
})

export const changeUserRoleSchema = z.object({
  roles: z
    .array(z.nativeEnum(UserRole))
    .min(1, 'At least one role is required'),
})

/**
 * CSV import schemas
 */
export const csvUserSchema = z.object({
  matricule: z
    .string()
    .min(1, 'Matricule is required')
    .regex(matriculePattern, 'Invalid matricule format'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .endsWith('@k48.fr', 'Must be a K48 email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name too short')
    .max(50, 'Name too long'),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || val === '' || phonePattern.test(val),
      'Invalid phone number format'
    ),
  batch: z
    .string()
    .min(1, 'Batch is required')
    .regex(batchPattern, 'Invalid batch format'),
  specialization: z.string().min(1, 'Specialization is required'),
})

export const csvImportSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine(
      file => file.size <= 10 * 1024 * 1024,
      'File size must be less than 10MB'
    )
    .refine(
      file => file.type === 'text/csv' || file.name.endsWith('.csv'),
      'File must be a CSV file'
    ),
  skipFirstRow: z.boolean().default(true),
  validateEmails: z.boolean().default(true),
})

/**
 * API key management schemas
 */
export const createApiKeySchema = z.object({
  applicationName: z
    .string()
    .min(1, 'Application name is required')
    .min(3, 'Application name must be at least 3 characters')
    .max(50, 'Application name must not exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9\s-_]+$/,
      'Application name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must not exceed 200 characters'),
})

export const rotateApiKeySchema = z.object({
  id: z.string().min(1, 'API key ID is required'),
})

/**
 * Audit log schemas
 */
export const auditFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  ipAddress: z.string().optional(),
  page: z.number().min(0).default(0),
  size: z.number().min(1).max(100).default(20),
  sort: z.string().optional(),
})

/**
 * Dashboard schemas
 */
export const dashboardFiltersSchema = z.object({
  dateRange: z
    .enum(['today', 'week', 'month', 'quarter', 'year'])
    .default('week'),
  refreshInterval: z.number().min(30).max(300).default(60), // seconds
})

/**
 * Search and pagination schemas
 */
export const paginationSchema = z.object({
  page: z.number().min(0).default(0),
  size: z.number().min(1).max(100).default(20),
  sort: z.string().optional(),
})

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long'),
  filters: z.record(z.string(), z.string()).optional(),
})

/**
 * Type inference helpers
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UserFormData = z.infer<typeof userSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
export type ChangeUserStatusFormData = z.infer<typeof changeUserStatusSchema>
export type ChangeUserRoleFormData = z.infer<typeof changeUserRoleSchema>
export type CSVUserData = z.infer<typeof csvUserSchema>
export type CSVImportFormData = z.infer<typeof csvImportSchema>
export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>
export type AuditFilterFormData = z.infer<typeof auditFilterSchema>
export type DashboardFiltersFormData = z.infer<typeof dashboardFiltersSchema>
export type PaginationFormData = z.infer<typeof paginationSchema>
export type SearchFormData = z.infer<typeof searchSchema>

/**
 * Form validation helpers
 */
export const validateMatricule = (matricule: string): boolean => {
  return matriculePattern.test(matricule)
}

export const validateEmail = (email: string): boolean => {
  return (
    z.string().email().safeParse(email).success && email.endsWith('@k48.fr')
  )
}

export const validatePhone = (phone: string): boolean => {
  return !phone || phonePattern.test(phone)
}

export const validateBatch = (batch: string): boolean => {
  return batchPattern.test(batch)
}

/**
 * Error message helpers
 */
export const getFieldError = (
  errors: Record<string, { message?: string }>,
  fieldName: string
): string | undefined => {
  return errors?.[fieldName]?.message
}

export const hasFieldError = (
  errors: Record<string, unknown>,
  fieldName: string
): boolean => {
  return !!errors?.[fieldName]
}
