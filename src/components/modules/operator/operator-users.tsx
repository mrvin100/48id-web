'use client'

/**
 * Operator Users Module
 *
 * Displays 48ID users who have authenticated externally via this operator account's
 * API key — i.e., the external consumers of the operator's platform.
 *
 * Columns: Matricule · Name · Email · Batch · Status · Total API Calls · First Seen · Last Seen
 */

import { useState } from 'react'
import { PageHeader } from '@/components/global'
import { useOperatorUsers } from '@/hooks/use-operator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Users, Activity } from 'lucide-react'

const PAGE_SIZE = 20

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function OperatorUsersModule({ accountId }: { accountId: string }) {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useOperatorUsers(accountId, {
    page,
    size: PAGE_SIZE,
  })
  const consumers = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  if (error)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="48ID users who accessed your platform via API key"
        />
        <div className="text-destructive py-8 text-center">
          Failed to load users: {error.message}
        </div>
      </div>
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={
          data
            ? `${data.totalElements} 48ID user${data.totalElements !== 1 ? 's' : ''} accessed your platform via API key`
            : 'API key consumers — 48ID users who authenticated via your operator key'
        }
      />

      {/* Summary card */}
      {!isLoading && data && data.totalElements > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-muted/50 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Total Consumers
            </p>
            <p className="mt-1 text-2xl font-bold">{data.totalElements}</p>
          </div>
          <div className="bg-muted/50 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Total API Calls
            </p>
            <p className="mt-1 text-2xl font-bold">
              {consumers
                .reduce((sum, c) => sum + (c.totalCalls ?? 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">on this page</p>
          </div>
          <div className="bg-muted/50 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Active Users
            </p>
            <p className="mt-1 text-2xl font-bold">
              {consumers.filter(c => c.status === 'ACTIVE').length}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">on this page</p>
          </div>
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
              Array.from({ length: 8 }).map((_, i) => (
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
                        <Users className="h-6 w-6" />
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
                    <div className="flex items-center justify-end gap-1">
                      <Activity className="text-muted-foreground h-3 w-3" />
                      <span className="text-sm font-medium">
                        {(consumer.totalCalls ?? 0).toLocaleString()}
                      </span>
                    </div>
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
