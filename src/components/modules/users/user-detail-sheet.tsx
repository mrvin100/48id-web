'use client'

/**
 * User Detail Sheet Component
 *
 * Slide-out sheet for viewing and editing user details.
 * Contains Profile, Activity, and Security tabs.
 *
 * Requirements: WEB-04-02, WEB-04-03, WEB-04-04
 */

import { User } from '@/types/auth.types'
import { useUser } from '@/hooks/use-users'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { UserEditForm } from './user-edit-form'
import {
  Clock,
  Calendar,
  Shield,
  Mail,
  User as UserIcon,
  IdCard,
  GraduationCap,
  Phone,
  Activity,
  Lock,
} from 'lucide-react'

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
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-2xl">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b p-6 pb-4">
          <SheetHeader className="gap-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={currentUser?.profilePicture} />
                  <AvatarFallback className="text-base font-semibold">
                    {currentUser?.firstName?.[0] || ''}
                    {currentUser?.lastName?.[0] ||
                      currentUser?.name?.[0] ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <SheetTitle className="text-lg leading-tight">
                    {currentUser?.name || 'Loading...'}
                  </SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">
                      {currentUser?.matricule}
                    </span>
                    {currentUser && (
                      <Badge
                        variant={
                          currentUser.status === 'ACTIVE'
                            ? 'default'
                            : currentUser.status === 'SUSPENDED'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {currentUser.status}
                      </Badge>
                    )}
                    {currentUser && (
                      <Badge variant="outline" className="text-xs">
                        {currentUser.role}
                      </Badge>
                    )}
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : currentUser ? (
          <Tabs
            defaultValue="profile"
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent px-6 py-3">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-primary h-auto rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:border-primary h-auto rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:border-primary h-auto rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent
              value="profile"
              className="m-0 flex-1 overflow-auto p-6 data-[state=inactive]:hidden"
            >
              <UserEditForm user={currentUser} />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent
              value="activity"
              className="m-0 flex-1 overflow-auto p-6 data-[state=inactive]:hidden"
            >
              <div className="space-y-6">
                {/* Account Timeline */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Account Timeline
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Account Created</p>
                          <span className="text-muted-foreground text-xs">
                            {new Date(
                              currentUser.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {new Date(currentUser.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Clock className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Last Login</p>
                          <span className="text-muted-foreground text-xs">
                            {currentUser.lastLoginAt
                              ? new Date(
                                  currentUser.lastLoginAt
                                ).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {currentUser.lastLoginAt
                            ? new Date(
                                currentUser.lastLoginAt
                              ).toLocaleTimeString()
                            : 'No login activity recorded'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Activity className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Last Updated</p>
                          <span className="text-muted-foreground text-xs">
                            {new Date(
                              currentUser.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {new Date(currentUser.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Recent Activity
                  </h3>
                  <Empty className="border-0 py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Activity className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No recent activity</EmptyTitle>
                      <EmptyDescription>
                        Activity history will appear here as the user interacts
                        with the system
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent
              value="security"
              className="m-0 flex-1 overflow-auto p-6 data-[state=inactive]:hidden"
            >
              <div className="space-y-6">
                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Account Status
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-card flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Shield className="text-muted-foreground h-5 w-5" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-muted-foreground text-xs">
                            Current account status
                          </p>
                        </div>
                      </div>
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

                    <div className="bg-card flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <IdCard className="text-muted-foreground h-5 w-5" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">Role</p>
                          <p className="text-muted-foreground text-xs">
                            User role and permissions
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{currentUser.role}</Badge>
                    </div>

                    <div className="bg-card flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Mail className="text-muted-foreground h-5 w-5" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">Email Verified</p>
                          <p className="text-muted-foreground text-xs">
                            Email verification status
                          </p>
                        </div>
                      </div>
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
                </div>

                <Separator />

                {/* User Information */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    User Information
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <UserIcon className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{currentUser.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{currentUser.email}</span>
                    </div>
                    {currentUser.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser.batch && (
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">Batch:</span>
                        <span className="font-medium">{currentUser.batch}</span>
                      </div>
                    )}
                    {currentUser.specialization && (
                      <div className="flex items-center gap-3 text-sm">
                        <IdCard className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          Specialization:
                        </span>
                        <span className="font-medium">
                          {currentUser.specialization}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Account Actions
                  </h3>
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">Security Actions</p>
                        <p className="text-muted-foreground text-xs">
                          Use the action menu (⋮) in the header to suspend,
                          reactivate, or force password reset for this user.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
