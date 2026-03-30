'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/global'
import {
  useOperatorAccounts,
  useCreateOperatorAccount,
  useDeleteOperatorAccount,
} from '@/hooks/use-operator'
import { useOperatorContext } from '@/stores/operator-store'
import { useAuthStore } from '@/stores/auth-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, LogIn, Plus, Trash2, Users } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { toast } from 'sonner'
import { MemberManagementPanel } from '@/components/modules/operator/member-management-panel'
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

const PAGE_SIZE = 10
const SKELETON_ROW_KEYS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']
const SKELETON_CELL_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']

export function StudentOperatorsModule() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data, isLoading, error } = useOperatorAccounts()
  const { selectOperator, selectedOperator, clearOperator } =
    useOperatorContext()
  const refreshUser = useAuthStore(state => state.refreshUser)
  const { mutate: createAccount, isPending: isCreating } =
    useCreateOperatorAccount()
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteOperatorAccount()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(
    null
  )

  const operators = useMemo(() => data ?? [], [data])
  const totalPages = Math.max(1, Math.ceil(operators.length / PAGE_SIZE))

  const paginatedOperators = useMemo(() => {
    const start = page * PAGE_SIZE
    return operators.slice(start, start + PAGE_SIZE)
  }, [operators, page])

  const handleSelectOperator = async (operator: (typeof operators)[0]) => {
    // Refresh JWT to ensure ROLE_OPERATOR is present in the token before making
    // operator API calls. The backend assigns ROLE_OPERATOR when a user becomes
    // an operator member — but the current JWT still holds the old roles until refreshed.
    try {
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })
      if (refreshRes.ok) {
        // Sync the auth store so the in-memory roles reflect the new JWT claims
        await refreshUser()
      }
    } catch {
      // Non-critical — continue; worst case the user sees a 401 and can retry
    }

    selectOperator({
      id: operator.id,
      name: operator.name,
      role: operator.memberRole === 'OWNER' ? 'OWN' : 'COLLABORATOR',
    })
    router.push(ROUTES.DASHBOARD)
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteAccount(deleteTarget.id, {
      onSuccess: () => {
        // If deleting the currently selected operator, exit operator mode
        if (selectedOperator?.id === deleteTarget.id) {
          clearOperator()
          router.push(ROUTES.DASHBOARD)
        }
        toast.success(`Operator account "${deleteTarget.name}" deleted`)
        setDeleteTarget(null)
      },
      onError: () => {
        toast.error('Failed to delete operator account')
        setDeleteTarget(null)
      },
    })
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string
    const description = (form.get('description') as string) || undefined

    createAccount(
      { name, description },
      {
        onSuccess: async newAccount => {
          setShowCreateDialog(false)
          toast.success(`Operator account "${newAccount.name}" created`)

          // Refresh JWT so the new ROLE_OPERATOR claim is in the token.
          // The backend adds ROLE_OPERATOR when a student creates an account,
          // but the current JWT still has only ROLE_STUDENT until refreshed.
          try {
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
            })
            if (refreshRes.ok) {
              // Sync the auth store so in-memory roles include ROLE_OPERATOR
              await refreshUser()
            } else {
              toast.warning(
                'Session refresh failed — some operator features may require re-login'
              )
            }
          } catch {
            // Non-critical: user can still navigate, worst case they re-login
          }

          // Auto-select the new account and go to its dashboard
          selectOperator({
            id: newAccount.id,
            name: newAccount.name,
            role: 'OWN',
          })
          router.push(ROUTES.DASHBOARD)
        },
        onError: () => toast.error('Failed to create operator account'),
      }
    )
  }

  let tableBodyContent: ReactNode[]
  if (isLoading) {
    tableBodyContent = SKELETON_ROW_KEYS.map(rowKey => (
      <TableRow key={rowKey}>
        {SKELETON_CELL_KEYS.map(cellKey => (
          <TableCell key={`${rowKey}-${cellKey}`}>
            <Skeleton className="h-5 w-24" />
          </TableCell>
        ))}
      </TableRow>
    ))
  } else if (paginatedOperators.length === 0) {
    tableBodyContent = [
      <TableRow key="empty">
        <TableCell colSpan={8} className="h-32">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No operator accounts yet</EmptyTitle>
              <EmptyDescription>
                Create a new operator account or wait to be invited to one.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableCell>
      </TableRow>,
    ]
  } else {
    tableBodyContent = paginatedOperators.flatMap(operator => {
      const badgeVariant =
        operator.memberStatus === 'ACTIVE' ? 'default' : 'secondary'
      const isSelected = selectedOperator?.id === operator.id
      const isExpanded = expandedAccountId === operator.id
      const isOwner = operator.memberRole === 'OWNER'

      const rows = [
        <TableRow
          key={operator.id}
          className={isSelected ? 'bg-muted' : 'hover:bg-muted/50'}
        >
          <TableCell className="font-medium">{operator.name}</TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {operator.description || '—'}
          </TableCell>
          <TableCell>
            <Badge variant={isOwner ? 'default' : 'secondary'}>
              {operator.memberRole}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant={badgeVariant}>{operator.memberStatus}</Badge>
          </TableCell>
          <TableCell className="text-sm">
            {new Date(operator.createdAt).toLocaleDateString()}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant={isSelected ? 'secondary' : 'default'}
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  handleSelectOperator(operator)
                }}
                disabled={operator.memberStatus !== 'ACTIVE'}
              >
                <LogIn className="mr-1 h-3 w-3" />
                {isSelected ? 'Active' : 'Enter'}
              </Button>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation()
                    handleDelete(operator.id, operator.name)
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </TableCell>
          <TableCell>
            {/* Members panel toggle — any member can view, owners can also invite/remove */}
            <Button
              variant={isExpanded ? 'secondary' : 'ghost'}
              size="sm"
              onClick={e => {
                e.stopPropagation()
                setExpandedAccountId(isExpanded ? null : operator.id)
              }}
              title="Manage members"
            >
              <Users className="h-3.5 w-3.5" />
            </Button>
          </TableCell>
        </TableRow>,
      ]

      // Inline member management panel
      if (isExpanded) {
        rows.push(
          <TableRow key={`${operator.id}-members`} className="bg-muted/30">
            <TableCell colSpan={8} className="px-6 py-4">
              <MemberManagementPanel
                accountId={operator.id}
                isOwner={isOwner}
              />
            </TableCell>
          </TableRow>
        )
      }

      return rows
    })
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Operators"
          description="Operator accounts associated with your profile"
        />
        <div className="text-destructive py-8 text-center">
          Failed to load operators: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operators"
        description="Select an operator account to access its dashboard, users, audit logs, traffic and API key"
      >
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Operator
        </Button>
      </PageHeader>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>{tableBodyContent}</TableBody>
        </Table>
      </div>

      {!isLoading && operators.length > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
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
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Operator Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>{' '}
              and all associated API keys, members, and audit logs. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Operator Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Operator Account</DialogTitle>
              <DialogDescription>
                Create a new operator account. You will be the owner and can
                invite collaborators later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., 48Hub Platform"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What is this operator account for?"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating…' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
