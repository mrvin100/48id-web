'use client'

/**
 * User Action Menu Component
 *
 * Row-level action dropdown menu for user operations.
 * Provides quick access to admin actions only.
 *
 * Note: View Details and Edit Profile are accessed by clicking the row
 * Requirements: WEB-04-05
 */

import { useState } from 'react'
import { MoreHorizontal, KeyRound, Lock } from 'lucide-react'
import { User } from '@/types/auth.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  useForcePasswordReset,
  useChangeUserStatus,
} from '@/hooks/use-users'

interface UserActionMenuProps {
  user: User
}

export function UserActionMenu({ user }: UserActionMenuProps) {
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)

  const forcePasswordReset = useForcePasswordReset()
  const changeStatus = useChangeUserStatus()

  const handlePasswordReset = async () => {
    try {
      await forcePasswordReset.mutateAsync(user.id)
      toast.success('Password reset email sent successfully')
      setShowPasswordResetDialog(false)
    } catch (error) {
      toast.error('Failed to send password reset email')
      setShowPasswordResetDialog(false)
    }
  }

  const handleSuspend = async () => {
    try {
      await changeStatus.mutateAsync({
        id: user.id,
        data: { status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' },
      })
      toast.success(
        `User ${user.status === 'SUSPENDED' ? 'reactivated' : 'suspended'} successfully`
      )
      setShowSuspendDialog(false)
    } catch (error) {
      toast.error('Failed to update user status')
      setShowSuspendDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowPasswordResetDialog(true)}
            disabled={forcePasswordReset.isPending}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Force password reset
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowSuspendDialog(true)}
            className={
              user.status === 'SUSPENDED'
                ? 'text-green-600'
                : 'text-destructive'
            }
            disabled={changeStatus.isPending}
          >
            <Lock className="mr-2 h-4 w-4" />
            {user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'} account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Password Reset Confirmation Dialog */}
      <AlertDialog
        open={showPasswordResetDialog}
        onOpenChange={setShowPasswordResetDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to {user.email}. The user
              will be required to set a new password on their next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              disabled={forcePasswordReset.isPending}
            >
              {forcePasswordReset.isPending ? 'Sending...' : 'Send Reset Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'} Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.status === 'SUSPENDED'
                ? `This will reactivate ${user.name}'s account and restore their access.`
                : `This will immediately suspend ${user.name}'s account and revoke all active sessions. The user will not be able to log in.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={changeStatus.isPending}
              className={
                user.status === 'SUSPENDED'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              }
            >
              {changeStatus.isPending
                ? 'Processing...'
                : user.status === 'SUSPENDED'
                  ? 'Reactivate'
                  : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
