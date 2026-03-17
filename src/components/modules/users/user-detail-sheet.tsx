'use client'

/**
 * User Detail Sheet Component
 *
 * Slide-out sheet for viewing and editing user details.
 * Contains Profile, Activity, and Security tabs.
 *
 * Requirements: WEB-04-02, WEB-04-03, WEB-04-04
 */

import { useState } from 'react'
import { User } from '@/types/auth.types'
import { useUser } from '@/hooks/use-users'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UserEditForm } from './user-edit-form'
import { UserActionMenu } from './user-action-menu'

interface UserDetailSheetProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({
  user,
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  const { data: userData, isLoading } = useUser(user?.id || '')

  const currentUser = userData || user

  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser?.profilePicture} />
                <AvatarFallback className="text-lg">
                  {currentUser?.firstName?.[0]}
                  {currentUser?.lastName?.[0] || currentUser?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">
                  {currentUser?.name || 'Loading...'}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  {currentUser?.matricule}
                  {currentUser && (
                    <Badge
                      variant={
                        currentUser.status === 'ACTIVE'
                          ? 'default'
                          : currentUser.status === 'SUSPENDED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {currentUser.status}
                    </Badge>
                  )}
                  {currentUser && (
                    <Badge variant="outline">{currentUser.role}</Badge>
                  )}
                </SheetDescription>
              </div>
            </div>
            {currentUser && (
              <UserActionMenu user={currentUser} onEditUser={() => {}} />
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : currentUser ? (
          <Tabs defaultValue="profile" className="mt-6 flex-1 overflow-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="flex-1 overflow-auto">
              <div className="py-4">
                <UserEditForm
                  user={currentUser}
                  onSuccess={() => {
                    // Sheet will close automatically via parent component
                  }}
                />
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="flex-1 overflow-auto">
              <div className="space-y-4 py-4">
                <h3 className="text-lg font-medium">Activity Information</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <span className="text-muted-foreground text-sm">
                      Last Login
                    </span>
                    <span className="text-sm">
                      {currentUser.lastLoginAt
                        ? new Date(currentUser.lastLoginAt).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-muted-foreground text-sm">
                      Account Created
                    </span>
                    <span className="text-sm">
                      {new Date(currentUser.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-muted-foreground text-sm">
                      Last Updated
                    </span>
                    <span className="text-sm">
                      {new Date(currentUser.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 font-medium">Recent Activity</h4>
                  <div className="text-muted-foreground text-sm">
                    Activity history will be displayed here
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="flex-1 overflow-auto">
              <div className="space-y-4 py-4">
                <h3 className="text-lg font-medium">Security Settings</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <span className="text-muted-foreground text-sm">
                      Account Status
                    </span>
                    <Badge
                      variant={
                        currentUser.status === 'ACTIVE'
                          ? 'default'
                          : currentUser.status === 'SUSPENDED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {currentUser.status}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-muted-foreground text-sm">Role</span>
                    <Badge variant="outline">{currentUser.role}</Badge>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-muted-foreground text-sm">
                      Email Verified
                    </span>
                    <Badge
                      variant={
                        currentUser.isEmailVerified ? 'default' : 'secondary'
                      }
                    >
                      {currentUser.isEmailVerified
                        ? 'Verified'
                        : 'Not Verified'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="font-medium">Account Actions</h4>
                  <p className="text-muted-foreground text-sm">
                    Dangerous actions that affect user access
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
