'use client'

/**
 * Admin Traffic Module
 *
 * Shows aggregated traffic statistics across all operator accounts.
 * Summary cards (totals) + detailed per-account table.
 *
 * Data: GET /api/dashboard/traffic → TrafficQueryPort.AggregatedTrafficView
 *
 * Columns per account:
 *   Account Name · Total API Calls · Last 24h Calls · Last Called At ·
 *   Total Member Actions · Last 24h Actions · Last Action At
 */

import { useAdminTraffic } from '@/hooks/use-dashboard'
import { PageHeader } from '@/components/global'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Activity, Key, Users, Clock } from 'lucide-react'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function SummaryCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        )}
        {sub && <p className="text-muted-foreground mt-1 text-xs">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function AdminTrafficModule() {
  const { data, isLoading, error } = useAdminTraffic()
  const accounts = data?.accounts ?? []

  // Compute totals
  const totalApiCalls = accounts.reduce(
    (sum, a) => sum + a.apiKeyTraffic.totalCalls,
    0
  )
  const totalLast24h = accounts.reduce(
    (sum, a) => sum + a.apiKeyTraffic.last24h,
    0
  )
  const totalMemberActions = accounts.reduce(
    (sum, a) => sum + a.memberActivity.totalActions,
    0
  )
  const activeAccounts = accounts.filter(
    a => a.apiKeyTraffic.totalCalls > 0
  ).length

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Traffic"
          description="API traffic across all operator accounts"
        />
        <div className="text-destructive py-8 text-center">
          Failed to load traffic data: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic"
        description={
          data
            ? `${accounts.length} operator account${accounts.length !== 1 ? 's' : ''} · generated ${formatDate(data.generatedAt)}`
            : 'Aggregated API traffic across all operator accounts'
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total API Calls"
          value={isLoading ? '…' : totalApiCalls}
          sub="All time across all accounts"
          icon={Key}
          loading={isLoading}
        />
        <SummaryCard
          title="Calls (Last 24h)"
          value={isLoading ? '…' : totalLast24h}
          sub="Across all operator accounts"
          icon={Activity}
          loading={isLoading}
        />
        <SummaryCard
          title="Member Actions"
          value={isLoading ? '…' : totalMemberActions}
          sub="Total operator member actions"
          icon={Users}
          loading={isLoading}
        />
        <SummaryCard
          title="Active Accounts"
          value={isLoading ? '…' : activeAccounts}
          sub="Accounts with at least one API call"
          icon={Clock}
          loading={isLoading}
        />
      </div>

      {/* Per-Account Detail Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Total API Calls</TableHead>
              <TableHead className="text-right">Last 24h</TableHead>
              <TableHead>Last API Call</TableHead>
              <TableHead className="text-right">Member Actions</TableHead>
              <TableHead className="text-right">Actions (24h)</TableHead>
              <TableHead>Last Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Activity className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No traffic data yet</EmptyTitle>
                      <EmptyDescription>
                        Traffic data will appear once operator accounts start
                        making API key calls.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map(account => (
                <TableRow key={account.accountId}>
                  <TableCell className="font-medium">
                    {account.accountName}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {account.apiKeyTraffic.totalCalls.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        account.apiKeyTraffic.last24h > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {account.apiKeyTraffic.last24h.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(account.apiKeyTraffic.lastCalledAt)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {account.memberActivity.totalActions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        account.memberActivity.last24h > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {account.memberActivity.last24h.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(account.memberActivity.lastActionAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
