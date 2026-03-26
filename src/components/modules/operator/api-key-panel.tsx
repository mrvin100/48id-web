'use client'

import { useState } from 'react'
import { Copy, Check, Key } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/global'
import { useOperatorApiKey, useCreateApiKey, useRotateApiKey, useDeleteApiKey } from '@/hooks/use-operator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApiKeyCreatedResponse } from '@/lib/api/operator'

export function ApiKeyPanel({ accountId, isOwner }: { accountId: string; isOwner: boolean }) {
  const { data: apiKey, isLoading } = useOperatorApiKey(accountId)
  const createMutation = useCreateApiKey(accountId)
  const rotateMutation = useRotateApiKey(accountId)
  const deleteMutation = useDeleteApiKey(accountId)
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    try {
      const result: ApiKeyCreatedResponse = await createMutation.mutateAsync({
        applicationName: 'My Operator Key',
      })
      setRawKey(result.key)
      toast.success('API key generated successfully')
    } catch { toast.error('Failed to generate API key') }
  }

  const handleRotate = async () => {
    try {
      const result: ApiKeyCreatedResponse = await rotateMutation.mutateAsync()
      setRawKey(result.key)
      toast.success('API key rotated successfully')
    } catch { toast.error('Failed to rotate API key') }
  }

  const handleRevoke = async () => {
    try {
      await deleteMutation.mutateAsync()
      setRawKey(null)
      toast.success('API key revoked')
    } catch { toast.error('Failed to revoke API key') }
  }

  const handleCopy = async () => {
    if (!rawKey) return
    await navigator.clipboard.writeText(rawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="API Key" description="Manage your operator API key" />
      {isLoading ? (
        <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-40" /></CardContent>
        </Card>
      ) : rawKey ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Key className="h-4 w-4" />
              Your API Key — copy it now, it won&apos;t be shown again
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border bg-white p-3 font-mono text-sm dark:bg-black">
              <span className="flex-1 break-all">{rawKey}</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRawKey(null)}>I&apos;ve saved my key</Button>
          </CardContent>
        </Card>
      ) : !apiKey ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Key className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">No API key exists for your account yet.</p>
            {isOwner && (
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Generating…' : 'Generate API Key'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" />{apiKey.appName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(apiKey.createdAt).toLocaleString()}</dd>
              {apiKey.lastUsedAt && (
                <><dt className="text-muted-foreground">Last used</dt>
                  <dd>{new Date(apiKey.lastUsedAt).toLocaleString()}</dd></>
              )}
            </dl>
            {isOwner && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleRotate} disabled={rotateMutation.isPending}>
                  {rotateMutation.isPending ? 'Rotating…' : 'Rotate'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Revoke</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently revoke the key. Any integrations using it will stop working immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRevoke}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Revoke
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
