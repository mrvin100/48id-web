'use client'

/**
 * Member Management Panel
 *
 * Shown to OWNER of an operator account.
 * Lists current members, allows invite by matricule, and remove collaborators.
 * WEB-S4-FE-07
 */

import { useState, useRef } from 'react'
import {
  useOperatorMembers,
  useInviteOperatorMember,
  useRemoveOperatorMember,
} from '@/hooks/use-operator'
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
import { Crown, Users, UserMinus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface MemberManagementPanelProps {
  accountId: string
  /** Whether the current user is the OWNER of this account */
  isOwner: boolean
}

export function MemberManagementPanel({
  accountId,
  isOwner,
}: MemberManagementPanelProps) {
  const [matricule, setMatricule] = useState('')
  const [removeTarget, setRemoveTarget] = useState<{
    id: string
    role: string
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: members, isLoading } = useOperatorMembers(accountId)
  const { mutate: invite, isPending: isInviting } =
    useInviteOperatorMember(accountId)
  const { mutate: remove, isPending: isRemoving } =
    useRemoveOperatorMember(accountId)

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = matricule.trim()
    if (!trimmed) return
    invite(trimmed, {
      onSuccess: () => {
        toast.success(`Invite sent to ${trimmed}`)
        setMatricule('')
        inputRef.current?.focus()
      },
      onError: async (err: unknown) => {
        let message = 'Failed to send invite'
        try {
          // ky wraps HTTP errors as HTTPError — try to read the JSON body
          if (err && typeof err === 'object' && 'response' in err) {
            const httpErr = err as { response: Response }
            const json = await httpErr.response.json().catch(() => null)
            message = json?.error || json?.message || message
          } else if (err instanceof Error) {
            message = err.message || message
          }
        } catch {
          /* ignore */
        }
        toast.error(message)
      },
    })
  }

  const confirmRemove = () => {
    if (!removeTarget) return
    remove(removeTarget.id, {
      onSuccess: () => {
        toast.success('Member removed')
        setRemoveTarget(null)
      },
      onError: async (err: unknown) => {
        let message = 'Failed to remove member'
        try {
          if (err && typeof err === 'object' && 'response' in err) {
            const httpErr = err as { response: Response }
            const json = await httpErr.response.json().catch(() => null)
            message = json?.error || json?.message || message
          } else if (err instanceof Error) {
            message = err.message || message
          }
        } catch {
          /* ignore */
        }
        toast.error(message)
        setRemoveTarget(null)
      },
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Members</h3>

      {/* Members table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              {isOwner && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5].map(j => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !members?.length ? (
              <TableRow>
                <TableCell
                  colSpan={isOwner ? 5 : 4}
                  className="text-muted-foreground py-6 text-center text-sm"
                >
                  No members yet.
                </TableCell>
              </TableRow>
            ) : (
              members.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">
                    {m.userId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.memberRole === 'OWNER' ? 'default' : 'secondary'
                      }
                      className="gap-1"
                    >
                      {m.memberRole === 'OWNER' ? (
                        <Crown className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      {m.memberRole}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.status === 'ACTIVE'
                          ? 'default'
                          : m.status === 'PENDING'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {m.memberRole !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setRemoveTarget({ id: m.id, role: m.memberRole })
                          }
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite form — owners only */}
      {isOwner && (
        <form onSubmit={handleInvite} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-matricule" className="text-xs">
              Invite by matricule
            </Label>
            <Input
              ref={inputRef}
              id="invite-matricule"
              value={matricule}
              onChange={e => setMatricule(e.target.value)}
              placeholder="K48-B3-006"
              className="font-mono"
              disabled={isInviting}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isInviting || !matricule.trim()}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            {isInviting ? 'Sending…' : 'Invite'}
          </Button>
        </form>
      )}

      {/* Remove confirmation */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={open => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the collaborator from this operator account. They
              will lose access immediately and may lose the OPERATOR role if
              they have no other active accounts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
