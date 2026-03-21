'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActivateAccount } from '@/hooks/use-activation'
import { ROUTES } from '@/lib/routes'

export function ActivateAccountModule() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const { isLoading, isSuccess, isError, data, error } = useActivateAccount(token)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Account Activation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          {!token && (
            <>
              <XCircle className="text-destructive h-12 w-12" />
              <p className="text-destructive font-medium">Invalid activation link. No token provided.</p>
              <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.LOGIN)}>
                Back to Login
              </Button>
            </>
          )}

          {token && isLoading && (
            <>
              <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
              <p className="text-muted-foreground">Activating your account…</p>
            </>
          )}

          {isSuccess && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-medium text-green-700 dark:text-green-400">
                {data?.message ?? 'Your account has been activated successfully.'}
              </p>
              <p className="text-muted-foreground text-sm">
                You can now log in with your matricule and the temporary password sent to your email.
              </p>
              <Button className="w-full" onClick={() => router.push(ROUTES.LOGIN)}>
                Go to Login
              </Button>
            </>
          )}

          {isError && (
            <>
              <XCircle className="text-destructive h-12 w-12" />
              <p className="text-destructive font-medium">
                {(error as Error)?.message ?? 'Activation failed. The link may have expired.'}
              </p>
              <p className="text-muted-foreground text-sm">
                If you need a new activation link, contact your administrator.
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.LOGIN)}>
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
