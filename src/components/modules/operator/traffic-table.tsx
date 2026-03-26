'use client'

/**
 * Operator Traffic Table
 *
 * Displays API key calls and member actions for the operator's account.
 * WEB-S4-FE-08
 */

import { Activity } from 'lucide-react'
import { PageHeader } from '@/components/global'
import { useOperatorTraffic } from '@/hooks/use-operator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'

export function TrafficTable() {
  const { data, isLoading, error } = useOperatorTraffic()

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Traffic"
          description="API key calls and member actions"
        />
        <div className="text-destructive py-8 text-center">
          Failed to load traffic data: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Traffic"
        description="Granular per-request detail scoped to your account"
      />

      {/* API Key Calls */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">API Key Calls</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Calls in Window</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !data?.apiKeyCalls?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Activity className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No API key calls yet</EmptyTitle>
                        <EmptyDescription>
                          API calls will appear here once your key is used.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                data.apiKeyCalls.map((call, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">
                      {new Date(call.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {call.ip}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {call.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{call.method}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {call.totalInWindow}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Member Actions */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Member Actions</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !data?.memberActions?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Activity className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No member actions yet</EmptyTitle>
                        <EmptyDescription>
                          Member activity will appear here once operators act.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                data.memberActions.map((action, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm">
                      {action.matricule}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{action.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {action.endpoint}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(action.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
