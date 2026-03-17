'use client'

/**
 * User Detail Sheet Component
 *
 * Slide-out sheet for viewing and editing user details.
 * Contains Profile, Activity, and Security tabs.
 *
 * Requirements: WEB-04-02, WEB-04-03, WEB-04-04
 */

import { User, UserStatus, UserRole } from '@/types/auth.types'
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
import { UserActionMenu } from './user-action-menu'
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
      <SheetContent className="flex flex-col sm:max-w-2xl p-0 gap-0">
        {/* Header Section */}
        <div className="flex flex-col gap-4 p-6 pb-4 border-b">
          <SheetHeader className="gap-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={currentUser?.profilePicture} />
                  <AvatarFallback className="text-base font-semibold">
                    {currentUser?.firstName?.[0] || ''}
                    {currentUser?.lastName?.[0] || currentUser?.name?.[0] || 'U'}
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
              {currentUser && (
                <UserActionMenu user={currentUser} onEditUser={() => {}} />
              )}
            </div>
          </SheetHeader>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : currentUser ? (
          <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b px-6 py-3 bg-transparent h-auto gap-6">
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 h-auto"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 h-auto"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 h-auto"
              >
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent
              value="profile"
              className="flex-1 overflow-auto m-0 p-6 data-[state=inactive]:hidden"
            >
              <UserEditForm user={currentUser} />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent
              value="activity"
              className="flex-1 overflow-auto m-0 p-6 data-[state=inactive]:hidden"
            >
              <div className="space-y-6">
                {/* Account Timeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Account Timeline
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Account Created</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(currentUser.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(currentUser.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Last Login</p>
                          <span className="text-xs text-muted-foreground">
                            {currentUser.lastLoginAt
                              ? new Date(currentUser.lastLoginAt).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {currentUser.lastLoginAt
                            ? new Date(currentUser.lastLoginAt).toLocaleTimeString()
                            : 'No login activity recorded'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Last Updated</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(currentUser.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(currentUser.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Recent Activity
                  </h3>
                  <Empty className="border-0 py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Activity className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No recent activity</EmptyTitle>
                      <EmptyDescription>
                        Activity history will appear here as the user interacts with the system
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent
              value="security"
              className="flex-1 overflow-auto m-0 p-6 data-[state=inactive]:hidden"
            >
              <div className="space-y-6">
                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Account Status
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-xs text-muted-foreground">
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

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <IdCard className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">Role</p>
                          <p className="text-xs text-muted-foreground">
                            User role and permissions
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{currentUser.role}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium">Email Verified</p>
                          <p className="text-xs text-muted-foreground">
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
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    User Information
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{currentUser.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{currentUser.email}</span>
                    </div>
                    {currentUser.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser.batch && (
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Batch:</span>
                        <span className="font-medium">{currentUser.batch}</span>
                      </div>
                    )}
                    {currentUser.specialization && (
                      <div className="flex items-center gap-3 text-sm">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
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
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Account Actions
                  </h3>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">
                          Security Actions
                        </p>
                        <p className="text-xs text-muted-foreground">
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
