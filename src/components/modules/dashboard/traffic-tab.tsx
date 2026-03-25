'use client'

import { useRouter } from 'next/navigation'
import { useDashboardTraffic } from '@/hooks/use-dashboard-traffic'
import { ROUTES } from '@/lib/routes'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

function fmt(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export function TrafficTab() {
  const router = useRouter()
  const { data, isLoading, isError } = useDashboardTraffic()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-destructive py-8 text-center text-sm">
        Failed to load traffic data.
      </p>
    )
  }

  if (!data?.accounts?.length) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No operator accounts with traffic yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account Name</TableHead>
          <TableHead>API Key Calls (total)</TableHead>
          <TableHead>API Key Calls (24h)</TableHead>
          <TableHead>Last API Call</TableHead>
          <TableHead>Member Actions (total)</TableHead>
          <TableHead>Member Actions (24h)</TableHead>
          <TableHead>Last Member Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.accounts.map(account => (
          <TableRow key={account.accountId}>
            <TableCell>
              <button
                className="focus-visible:ring-ring cursor-pointer font-medium focus-visible:ring-2 focus-visible:outline-none"
                aria-label={`View traffic for ${account.accountName}`}
                onClick={() =>
                  router.push(
                    ROUTES.OPERATOR_ACCOUNT_TRAFFIC(account.accountId)
                  )
                }
              >
                {account.accountName}
              </button>
            </TableCell>
            <TableCell>{account.apiKeyTraffic.totalCalls}</TableCell>
            <TableCell>{account.apiKeyTraffic.last24h}</TableCell>
            <TableCell>{fmt(account.apiKeyTraffic.lastCalledAt)}</TableCell>
            <TableCell>{account.memberActivity.totalActions}</TableCell>
            <TableCell>{account.memberActivity.last24h}</TableCell>
            <TableCell>{fmt(account.memberActivity.lastActionAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
