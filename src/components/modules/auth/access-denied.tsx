'use client'

/**
 * Access Denied Module Component
 *
 * Displays access denied message for users without sufficient permissions.
 * Provides navigation options and contact information.
 *
 * Requirements: 1.5, 10.2
 */

import { useRouter } from 'next/navigation'
import { ShieldX, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { ROUTES } from '@/lib/routes'
import { config } from '@/lib/env'

export function AccessDeniedModule() {
  const router = useRouter()
  const { user } = useAuthStore()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoToDashboard = () => {
    router.push(ROUTES.DASHBOARD)
  }

  const handleContactAdmin = () => {
    window.location.href = `mailto:${config.contact.adminEmail}?subject=Access Request - 48ID Admin Portal&body=Hello,%0D%0A%0D%0AI am requesting access to additional features in the 48ID Admin Portal.%0D%0A%0D%0AUser Details:%0D%0AMatricule: ${user?.matricule || 'N/A'}%0D%0ARole: ${user?.role || 'N/A'}%0D%0A%0D%0APlease review my access permissions.%0D%0A%0D%0AThank you.`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this resource
          </p>
        </div>

        {/* Error Details */}
        <Alert variant="destructive">
          <ShieldX />
          <AlertTitle>Insufficient Permissions</AlertTitle>
          <AlertDescription>
            Your current role does not have sufficient permissions to access
            this page. Contact your system administrator if you believe this is
            an error.
          </AlertDescription>
        </Alert>

        {/* User Information */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Current User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Matricule:</span>
                <code className="font-mono text-sm">{user.matricule}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleGoBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            onClick={handleGoToDashboard}
            variant="default"
            className="w-full"
          >
            Go to Dashboard
          </Button>

          <Button
            onClick={handleContactAdmin}
            variant="ghost"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact Administrator
          </Button>
        </div>

        {/* Help Text */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-xs text-gray-500">
              If you need access to additional features, please contact your
              system administrator at{' '}
              <a
                href={`mailto:${config.contact.adminEmail}`}
                className="text-blue-600 underline hover:text-blue-500"
              >
                {config.contact.adminEmail}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
