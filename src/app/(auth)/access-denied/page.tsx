/**
 * Access Denied Page
 *
 * Displayed when users don't have sufficient permissions
 * to access admin-only features.
 */

import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-600">
          You don&apos;t have permission to access this resource
        </p>
      </div>

      {/* Content */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="space-y-4 text-center">
          <p className="text-gray-700">
            The 48ID Admin Portal is restricted to authorized administrators
            only. Your current account does not have the required permissions to
            access this area.
          </p>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Students:</strong> Please use the main 48ID portal for
              student services. This administrative interface is not intended
              for student use.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/login">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>

            <Button asChild>
              <a href="mailto:admin@48id.com">Contact Administrator</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Help Information */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                If you believe you should have access to this area, please
                contact your system administrator. Include your matricule and
                the specific resource you were trying to access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
