'use client'

/**
 * Login Module Component
 *
 * Provides authentication interface for the 48ID Admin Portal.
 * Features form validation, loading states, and error handling.
 *
 * Requirements: 1.1, 1.4, 8.1, 9.1, 9.2
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { Eye, EyeOff, AlertCircle, Info } from 'lucide-react'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SubmitButton } from '@/components/global'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { createFormConfig } from '@/lib/form-config'
import { useAuthStore } from '@/stores/auth-store'
import { LoginCredentials } from '@/types/auth.types'
import { ROUTES } from '@/lib/routes'

// Form schema using Zod
const loginSchema = z.object({
  matricule: z
    .string()
    .min(1, 'Matricule is required')
    .regex(
      /^K48-\d{4}-\d{3}$/,
      'Matricule must be in format K48-YYYY-XXX (e.g., K48-2024-001)'
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginModule() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>(
    createFormConfig(loginSchema, {
      defaultValues: {
        matricule: '',
        password: '',
      },
    })
  )

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()

      const credentials: LoginCredentials = {
        matricule: data.matricule.toUpperCase(),
        password: data.password,
      }

      const response = await login(credentials)

      if (response.success) {
        // Redirect to dashboard on successful login
        router.push(ROUTES.DASHBOARD)
      } else {
        // Handle login failure - errors will be shown via global error state
        console.error('Login failed:', response.message)
      }
    } catch (err) {
      console.error('Login submission error:', err)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">48ID Admin Portal</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your administrator account
        </p>
      </div>

      {/* Login Form */}
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Global Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>
                  {error.message || 'An error occurred during login'}
                </AlertDescription>
              </Alert>
            )}

            {/* Matricule Field */}
            <Controller
              name="matricule"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Matricule <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="Enter your matricule"
                    autoComplete="username"
                    autoCapitalize="characters"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading || form.formState.isSubmitting}
                    className={
                      fieldState.invalid
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  <FieldDescription>
                    Enter your matricule in format K48-YYYY-XXX (e.g.,
                    K48-2024-001)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Password <span className="text-red-500">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading || form.formState.isSubmitting}
                      className={
                        fieldState.invalid
                          ? 'border-red-500 pr-10 focus:border-red-500'
                          : 'pr-10'
                      }
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      disabled={isLoading || form.formState.isSubmitting}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FieldDescription>
                    Enter your password (minimum 6 characters)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Submit Button */}
            <SubmitButton
              isLoading={isLoading || form.formState.isSubmitting}
              loadingText="Signing in..."
            >
              Sign In
            </SubmitButton>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Access is restricted to authorized administrators only.
              <br />
              Contact your system administrator if you need assistance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Info />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          This is a secure administrative interface. All access attempts are
          logged and monitored. Unauthorized access is prohibited and may result
          in legal action.
        </AlertDescription>
      </Alert>
    </div>
  )
}
