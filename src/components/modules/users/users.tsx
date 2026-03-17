'use client'

/**
 * Users Module Component
 *
 * User management interface for the 48ID Admin Portal.
 * Provides user listing, search, and management capabilities.
 *
 * Requirements: WEB-04-01, WEB-04-02
 */

import { PageHeader } from '@/components/global'
import { DataTable } from './data-table'
import { columns } from './columns'
import { useUserManagement } from '@/hooks/use-users'

export function UsersModule() {
  const { users, totalUsers, isLoading, isError, error } = useUserManagement()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage user accounts and permissions"
        />
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage user accounts and permissions"
        />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="text-destructive mb-2">Error loading users</div>
            <div className="text-muted-foreground text-sm">
              {error?.message || 'Failed to load users'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`Manage user accounts and permissions • ${totalUsers} total users`}
      />

      <DataTable columns={columns} data={users} />
    </div>
  )
}
