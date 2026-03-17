'use client'

/**
 * Users Module Component
 *
 * User management interface for the 48ID Admin Portal.
 * Provides user listing, search, and management capabilities.
 *
 * Requirements: WEB-04-01, WEB-04-02
 */

import { useState } from 'react'
import { PageHeader } from '@/components/global'
import { DataTable } from './data-table'
import { columns } from './columns'
import { UserDetailSheet } from './user-detail-sheet'
import { useUserManagement } from '@/hooks/use-users'
import { User } from '@/types/auth.types'

export function UsersModule() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { users, totalUsers, isLoading, isError, error } = useUserManagement()

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setSheetOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setSheetOpen(true)
    // The sheet will open with the Profile tab in edit mode
  }

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

      <DataTable
        columns={columns({
          onViewDetails: handleViewDetails,
          onEditUser: handleEditUser,
        })}
        data={users}
      />

      <UserDetailSheet
        user={selectedUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
