'use client'

/**
 * Audit Log Module Component
 *
 * Audit log viewer with filtering and pagination.
 *
 * Requirements: WEB-08-01
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Search, X, FileText } from 'lucide-react'
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function AuditLogModule() {
  const [eventType, setEventType] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()

  const { data, isLoading, error } = useAuditLog({
    eventType: eventType !== 'all' ? eventType : undefined,
    dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
    dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
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
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
          <SelectTrigger className="w-[180px]">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, 'PPP') : <span>From Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, 'PPP') : <span>To Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom(undefined)
              setDateTo(undefined)
            }}
          >
            Clear Dates
          </Button>
        )}
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
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
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
              events.map(event => (
                <TableRow key={event.id}>
                  <TableCell>
                    <AuditEventBadge eventType={event.eventType} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{event.userName}</span>
                      <span className="text-muted-foreground font-mono text-xs">
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
