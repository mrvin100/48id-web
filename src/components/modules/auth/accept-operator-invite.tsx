'use client'

/**
 * Accept Operator Invite Module
 *
 * Renders the accept-invite page for operator account collaborator invites.
 * The invite token is passed via the URL query param `?token=...`.
 * WEB-S4-FE-12
 */

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAcceptOperatorInvite } from '@/hooks/use-operator'
import { ROUTES } from '@/lib/routes'

export function AcceptOperatorInviteModule() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const {
    mutate: accept,
    isPending,
    isSuccess,
    isError,
    error,
  } = useAcceptOperatorInvite()

  // Auto-accept when the token is present on mount
  useEffect(() => {
    if (token) {
      accept(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Operator Account Invite</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          {/* No token */}
          {!token && (
            <>
              <XCircle className="text-destructive h-12 w-12" />
              <p className="text-destructive font-medium">
                Invalid invite link. No token provided.
              </p>
              <p className="text-muted-foreground text-sm">
                Please use the link from your invitation email.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(ROUTES.LOGIN)}
              >
                Back to Login
              </Button>
            </>
          )}

          {/* Loading */}
          {token && isPending && (
            <>
              <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
              <p className="text-muted-foreground">
                Accepting your invitation…
              </p>
            </>
          )}

          {/* Success */}
          {isSuccess && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-medium text-green-700 dark:text-green-400">
                You've joined the operator account!
              </p>
              <p className="text-muted-foreground text-sm">
                You now have collaborator access. Log in to view your operator
                dashboard.
              </p>
              <Button
                className="w-full"
                onClick={() => router.push(ROUTES.LOGIN)}
              >
                Go to Login
              </Button>
            </>
          )}

          {/* Error */}
          {isError && (
            <>
              <XCircle className="text-destructive h-12 w-12" />
              <p className="text-destructive font-medium">
                {(error as Error)?.message ||
                  'Invite acceptance failed. The link may have expired or already been used.'}
              </p>
              <p className="text-muted-foreground text-sm">
                Contact the account owner to request a new invitation.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(ROUTES.LOGIN)}
              >
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
