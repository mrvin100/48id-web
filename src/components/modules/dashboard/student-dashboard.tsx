'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useOperatorContext } from '@/stores/operator-store'
import { useOperatorAccounts } from '@/hooks/use-operator'
import { PageHeader } from '@/components/global'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  User,
  GraduationCap,
  ShieldCheck,
  Mail,
  BookOpen,
  Clock,
  Building2,
  LogIn,
  Crown,
  Users,
  ArrowRight,
} from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import type { MyOperatorAccount } from '@/lib/api/operator'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function statusVariant(
  status?: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'INACTIVE':
    case 'PENDING':
      return 'secondary'
    case 'SUSPENDED':
    case 'LOCKED':
      return 'destructive'
    default:
      return 'outline'
  }
}

// ── Operator Row ──────────────────────────────────────────────────────────────

function OperatorRow({ account }: { account: MyOperatorAccount }) {
  const router = useRouter()
  const { selectOperator } = useOperatorContext()
  const isOwner = account.memberRole === 'OWNER'

  const handleEnter = async () => {
    try {
      await fetch('/api/auth/refresh', { method: 'POST' })
    } catch {
      // non-critical
    }
    selectOperator({
      id: account.id,
      name: account.name,
      role: isOwner ? 'OWN' : 'COLLABORATOR',
    })
    router.push(ROUTES.DASHBOARD)
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{account.name}</TableCell>
      <TableCell>
        <Badge variant={isOwner ? 'default' : 'secondary'} className="text-xs">
          {isOwner ? (
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3" /> Owner
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Collaborator
            </span>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={account.memberStatus === 'ACTIVE' ? 'outline' : 'secondary'}
          className="text-xs"
        >
          {account.memberStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="outline"
          onClick={handleEnter}
          disabled={account.memberStatus !== 'ACTIVE'}
        >
          <LogIn className="mr-1 h-3 w-3" />
          Enter
        </Button>
      </TableCell>
    </TableRow>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function StudentDashboardModule() {
  const user = useAuthStore(state => state.user)
  const { data: accounts, isLoading: accountsLoading } = useOperatorAccounts()

  const displayName = useMemo(() => {
    if (!user) return 'Student'
    return (
      user.name ||
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      'Student'
    )
  }, [user])

  const activeAccounts =
    accounts?.filter(a => a.memberStatus === 'ACTIVE') ?? []
  const pendingAccounts =
    accounts?.filter(a => a.memberStatus === 'PENDING') ?? []
  const previewAccounts = accounts?.slice(0, 5) ?? []
  const hasMore = (accounts?.length ?? 0) > 5

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${displayName}`}
      />

      {/* Identity Overview */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Identity Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matricule</CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-xl font-bold">
                {user?.matricule ?? '—'}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Your unique identifier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Status
              </CardTitle>
              <ShieldCheck className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Badge variant={statusVariant(user?.status)} className="text-sm">
                {user?.status ?? '—'}
              </Badge>
              <p className="text-muted-foreground mt-2 text-xs">
                {user?.status === 'ACTIVE'
                  ? 'Your account is in good standing'
                  : user?.status
                    ? 'Contact an admin for assistance'
                    : 'Loading status…'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Batch</CardTitle>
              <GraduationCap className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{user?.batch ?? '—'}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Graduation cohort
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Profile Details */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Profile Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
              <Mail className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="truncate text-sm font-medium">
                {user?.email || '—'}
              </p>
              {user?.isEmailVerified !== undefined && (
                <Badge
                  variant={user.isEmailVerified ? 'default' : 'secondary'}
                  className="mt-1 text-xs"
                >
                  {user.isEmailVerified ? 'Verified' : 'Not verified'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Specialization
              </CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {user?.specialization ?? '—'}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Area of study
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Login</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {formatDate(user?.lastLoginAt)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Previous session
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Operator Accounts — compact table, max 5 rows */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Operator Accounts
          </h2>
          {!accountsLoading && accounts && accounts.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs">
                {activeAccounts.length} active
                {pendingAccounts.length > 0 &&
                  `, ${pendingAccounts.length} pending`}
              </span>
              <Link
                href={ROUTES.STUDENT.OPERATORS}
                className="text-primary flex items-center gap-1 text-xs hover:underline"
              >
                {hasMore ? `View all (${accounts.length})` : 'Manage'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {accountsLoading ? (
          <div className="rounded-md border">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
              >
                <Skeleton className="h-4 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : previewAccounts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Your Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewAccounts.map(account => (
                  <OperatorRow key={account.id} account={account} />
                ))}
              </TableBody>
            </Table>
            {hasMore && (
              <div className="border-t px-4 py-2 text-center">
                <Link
                  href={ROUTES.STUDENT.OPERATORS}
                  className="text-muted-foreground hover:text-foreground text-xs hover:underline"
                >
                  + {(accounts?.length ?? 0) - 5} more — view all on the
                  Operators page
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Building2 className="text-muted-foreground mb-3 h-8 w-8 opacity-40" />
              <p className="text-muted-foreground text-sm font-medium">
                No operator accounts yet
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                <Link
                  href={ROUTES.STUDENT.OPERATORS}
                  className="text-primary hover:underline"
                >
                  Go to Operators
                </Link>{' '}
                to create or join an operator account.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
