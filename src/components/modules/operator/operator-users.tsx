'use client'

/**
 * Operator Users Module
 *
 * Two tabs:
 *  1. Members    — Who manages this operator account (OWNER + COLLABORATORs).
 *                  OWNER can invite new collaborators by matricule and remove existing ones.
 *  2. API Users  — 48ID users who authenticated externally via this account's API key.
 *                  Shows usage stats: total calls, first/last seen.
 */

import { useState } from 'react'
import { PageHeader } from '@/components/global'
import {
  useOperatorMembers,
  useInviteOperatorMember,
  useRemoveOperatorMember,
  useOperatorUsers,
} from '@/hooks/use-operator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Users, UserPlus, Trash2, Crown, Activity, Mail } from 'lucide-react'
import { toast } from 'sonner'
import type { OperatorMember } from '@/lib/api/operator'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

const MATRICULE_PATTERN = /^K48-B\d{1,4}-\d+$/

// ── Members Tab ───────────────────────────────────────────────────────────────

function MembersTab({
  accountId,
  isOwner,
}: {
  accountId: string
  isOwner: boolean
}) {
  const { data: members, isLoading, error } = useOperatorMembers(accountId)
  const { mutate: invite, isPending: isInviting } =
    useInviteOperatorMember(accountId)
  const { mutate: remove, isPending: isRemoving } =
    useRemoveOperatorMember(accountId)

  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [matriculeInput, setMatriculeInput] = useState('')
  const [matriculeError, setMatriculeError] = useState('')
  const [removeTarget, setRemoveTarget] = useState<OperatorMember | null>(null)

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    const m = matriculeInput.trim()

    if (!MATRICULE_PATTERN.test(m)) {
      setMatriculeError('Must follow format K48-B{n}-{seq}, e.g. K48-B1-42')
      return
    }
    setMatriculeError('')

    invite(m, {
      onSuccess: () => {
        setShowInviteDialog(false)
        setMatriculeInput('')
        toast.success(
          `Invite sent to ${m} — they will receive an email to accept.`
        )
      },
      onError: async (err: unknown) => {
        // ky throws HTTPError — read the response body to get backend message
        let backendMsg = ''
        try {
          // ky HTTPError has a .response property (Response object)
          const httpErr = err as { response?: Response }
          if (httpErr.response) {
            const body = (await httpErr.response.json()) as { error?: string }
            backendMsg = body?.error ?? ''
          }
        } catch {
          // ignore parse errors, fall through to generic handling
        }

        const status =
          (err as { response?: { status?: number } }).response?.status ?? 0

        if (
          status === 404 ||
          backendMsg.toLowerCase().includes('not found') ||
          backendMsg.toLowerCase().includes('no user')
        ) {
          toast.error(
            `No 48ID user found with matricule "${m}". Please check the matricule and try again.`
          )
        } else if (
          status === 409 &&
          backendMsg.toLowerCase().includes('yourself')
        ) {
          toast.error(
            'You cannot invite yourself to your own operator account.'
          )
        } else if (
          status === 409 &&
          backendMsg.toLowerCase().includes('already an active member')
        ) {
          toast.error(`"${m}" is already an active member of this account.`)
        } else if (status === 409) {
          // PENDING member re-invited — backend resent the email (idempotent)
          toast.info(
            `"${m}" already has a pending invite. A new invite email has been sent.`
          )
          setShowInviteDialog(false)
          setMatriculeInput('')
        } else if (status === 403) {
          toast.error('Only the account owner can invite collaborators.')
        } else {
          toast.error(
            backendMsg
              ? `Failed to send invite: ${backendMsg}`
              : 'Failed to send invite. Please try again.'
          )
        }
      },
    })
  }

  const handleRemove = () => {
    if (!removeTarget) return
    const memberLabel = removeTarget.name ?? removeTarget.matricule ?? 'Member'

    // removeMember uses userId (not membership record id) per backend contract
    remove(removeTarget.userId, {
      onSuccess: () => {
        setRemoveTarget(null)
        toast.success(`${memberLabel} has been removed from this account.`)
      },
      onError: async (err: unknown) => {
        setRemoveTarget(null)
        let msg = ''
        try {
          const httpErr = err as { response?: Response }
          if (httpErr.response) {
            const body = (await httpErr.response.json()) as { error?: string }
            msg = body?.error ?? ''
          }
        } catch {
          /* ignore */
        }

        if (msg.includes('owner')) {
          toast.error('Cannot remove the account owner.')
        } else if (msg.includes('No membership') || msg.includes('404')) {
          toast.error(`${memberLabel} is no longer a member of this account.`)
        } else if (msg.includes('403') || msg.includes('permission')) {
          toast.error('Only the account owner can remove members.')
        } else {
          toast.error(msg || 'Failed to remove member. Please try again.')
        }
      },
    })
  }

  if (error) {
    return (
      <div className="text-destructive py-8 text-center text-sm">
        Failed to load members: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? 'Loading members…'
            : `${members?.length ?? 0} member${members?.length !== 1 ? 's' : ''}`}
        </p>
        {isOwner && (
          <Button size="sm" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Collaborator
          </Button>
        )}
      </div>

      {/* Members table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              {isOwner && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: isOwner ? 6 : 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !members?.length ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 6 : 5} className="h-32">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Users className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No members yet</EmptyTitle>
                      <EmptyDescription>
                        {isOwner
                          ? 'Invite collaborators by their 48ID matricule.'
                          : 'No members found.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              members.map(member => {
                const isThisOwner = member.memberRole === 'OWNER'
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-sm">
                      {member.matricule ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {member.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isThisOwner ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {isThisOwner ? (
                          <span className="flex items-center gap-1">
                            <Crown className="h-3 w-3" /> Owner
                          </span>
                        ) : (
                          'Collaborator'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === 'ACTIVE' ? 'outline' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {member.status === 'PENDING' ? (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Invite sent
                          </span>
                        ) : (
                          member.status
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(member.createdAt)}
                    </TableCell>
                    {isOwner && (
                      <TableCell>
                        {/* Can't remove the owner */}
                        {!isThisOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setRemoveTarget(member)}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite Collaborator</DialogTitle>
              <DialogDescription>
                Enter the 48ID matricule of the student you want to invite. They
                will receive an email with a link to accept the invitation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                placeholder="K48-B1-42"
                value={matriculeInput}
                onChange={e => {
                  setMatriculeInput(e.target.value)
                  setMatriculeError('')
                }}
                autoComplete="off"
                required
              />
              {matriculeError && (
                <p className="text-destructive text-xs">{matriculeError}</p>
              )}
              <p className="text-muted-foreground text-xs">
                Format: K48-B&#x7B;batch&#x7D;-&#x7B;seq&#x7D; · e.g. K48-B1-42
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false)
                  setMatriculeInput('')
                  setMatriculeError('')
                }}
                disabled={isInviting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? 'Sending invite…' : 'Send Invite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={open => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove{' '}
              <strong>
                {removeTarget?.name ?? removeTarget?.matricule ?? 'this member'}
              </strong>{' '}
              from this operator account? They will lose access immediately. If
              they have no other operator accounts, they will also lose the
              Operator role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing…' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── API Consumers Tab ─────────────────────────────────────────────────────────

const PAGE_SIZE = 20

function ApiConsumersTab({ accountId }: { accountId: string }) {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useOperatorUsers(accountId, {
    page,
    size: PAGE_SIZE,
  })
  const consumers = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  if (error)
    return (
      <div className="text-destructive py-8 text-center text-sm">
        Failed to load API consumers: {error.message}
      </div>
    )

  return (
    <div className="space-y-4">
      {/* Summary */}
      {!isLoading && data && data.totalElements > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total Consumers', value: data.totalElements },
            {
              label: 'Total API Calls',
              value: consumers
                .reduce((s, c) => s + (c.totalCalls ?? 0), 0)
                .toLocaleString(),
              sub: 'on this page',
            },
            {
              label: 'Active Users',
              value: consumers.filter(c => c.status === 'ACTIVE').length,
              sub: 'on this page',
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
              {sub && (
                <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">API Calls</TableHead>
              <TableHead>First Seen</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : consumers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Activity className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No API consumers yet</EmptyTitle>
                      <EmptyDescription>
                        Once 48ID users authenticate via your operator API key,
                        they will appear here with their usage statistics.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              consumers.map(consumer => (
                <TableRow key={consumer.userId}>
                  <TableCell className="font-mono text-sm font-medium">
                    {consumer.matricule}
                  </TableCell>
                  <TableCell className="text-sm">
                    {consumer.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {consumer.email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {consumer.batch ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        consumer.status === 'ACTIVE' ? 'default' : 'secondary'
                      }
                    >
                      {consumer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1 text-sm font-medium">
                      <Activity className="text-muted-foreground h-3 w-3" />
                      {(consumer.totalCalls ?? 0).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(consumer.firstSeen)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(consumer.lastSeen)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function OperatorUsersModule({
  accountId,
  isOwner = false,
}: {
  accountId: string
  isOwner?: boolean
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Account members and external API consumers"
      />
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="consumers">
            <Activity className="mr-2 h-4 w-4" />
            API Consumers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <MembersTab accountId={accountId} isOwner={isOwner} />
        </TabsContent>
        <TabsContent value="consumers" className="mt-4">
          <ApiConsumersTab accountId={accountId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
