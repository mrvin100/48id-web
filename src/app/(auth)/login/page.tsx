'use client'

/**
 * Login Page Component
 *
 * Provides authentication interface for the 48ID Admin Portal.
 * Features form validation, loading states, and error handling.
 *
 * Requirements: 1.1, 1.4, 8.1, 9.1, 9.2
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth-store'
import { LoginCredentials } from '@/types/auth.types'

type LoginFormData = {
  matricule: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()

      // Manual validation
      if (!data.matricule || data.matricule.trim().length === 0) {
        setFormError('matricule', {
          type: 'manual',
          message: 'Matricule is required',
        })
        return
      }

      if (!data.password || data.password.length === 0) {
        setFormError('password', {
          type: 'manual',
          message: 'Password is required',
        })
        return
      }

      const credentials: LoginCredentials = {
        matricule: data.matricule.toUpperCase(),
        password: data.password,
      }

      const response = await login(credentials)

      if (response.success) {
        // Redirect to dashboard on successful login
        router.push('/dashboard')
      } else {
        // Handle login failure
        if (response.message?.includes('matricule')) {
          setFormError('matricule', {
            type: 'manual',
            message: 'Invalid matricule',
          })
        } else if (response.message?.includes('password')) {
          setFormError('password', {
            type: 'manual',
            message: 'Invalid password',
          })
        }
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
      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Global Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || 'An error occurred during login'}
              </AlertDescription>
            </Alert>
          )}

          {/* Matricule Field */}
          <div className="space-y-2">
            <Label htmlFor="matricule">
              Matricule <span className="text-red-500">*</span>
            </Label>
            <Input
              id="matricule"
              type="text"
              placeholder="Enter your matricule"
              autoComplete="username"
              autoCapitalize="characters"
              {...register('matricule')}
              className={
                errors.matricule ? 'border-red-500 focus:border-red-500' : ''
              }
              disabled={isLoading || isSubmitting}
            />
            {errors.matricule && (
              <p className="text-sm text-red-600" role="alert">
                {errors.matricule.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
                className={
                  errors.password
                    ? 'border-red-500 pr-10 focus:border-red-500'
                    : 'pr-10'
                }
                disabled={isLoading || isSubmitting}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                disabled={isLoading || isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Access is restricted to authorized administrators only.
            <br />
            Contact your system administrator if you need assistance.
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Security Notice
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This is a secure administrative interface. All access attempts
                are logged and monitored. Unauthorized access is prohibited and
                may result in legal action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
