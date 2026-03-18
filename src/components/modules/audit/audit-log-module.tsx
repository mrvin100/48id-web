'use client'

/**
 * Audit Log Module Component
 *
 * Audit log viewer with filtering and pagination.
 *
 * Requirements: WEB-08-01
 */

import { useState } from 'react'
import { PageHeader } from '@/components/global'
import { useAuditLog } from '@/hooks/use-audit'
import { AuditEventBadge } from './audit-event-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { FileText, Search, X } from 'lucide-react'

export function AuditLogModule() {
  const [eventType, setEventType] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const { data, isLoading, error } = useAuditLog({
    eventType: eventType !== 'all' ? eventType : undefined,
    page: 0,
    size: 50,
  })

  const events = data?.content ?? []

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Audit Log"
          description="System activity and security events"
        />
        <div className="text-destructive py-8 text-center">
          Failed to load audit log: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="System activity and security events"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch('')}
              className="absolute top-0 right-0 h-full px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
            <SelectItem value="LOGIN_FAILURE">Login Failure</SelectItem>
            <SelectItem value="LOGOUT">Logout</SelectItem>
            <SelectItem value="ACCOUNT_LOCKED">Account Locked</SelectItem>
            <SelectItem value="PASSWORD_CHANGED">Password Changed</SelectItem>
            <SelectItem value="ROLE_CHANGED">Role Changed</SelectItem>
            <SelectItem value="CSV_IMPORT">CSV Import</SelectItem>
            <SelectItem value="API_KEY_CREATED">API Key Created</SelectItem>
            <SelectItem value="API_KEY_REVOKED">API Key Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No audit events</EmptyTitle>
                      <EmptyDescription>
                        No audit events match your filters
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <AuditEventBadge eventType={event.eventType} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{event.userName}</span>
                      <span className="text-muted-foreground text-xs font-mono">
                        {event.userMatricule}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {event.ipAddress}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(event.timestamp).toLocaleString()}
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
