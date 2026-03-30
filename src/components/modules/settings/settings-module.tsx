'use client'

/**
 * Settings Module Component
 *
 * User profile and settings management.
 *
 * Requirements: WEB-10-01, WEB-10-02, WEB-10-03
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod/v4'
import {
  User as UserIcon,
  Mail,
  Phone,
  IdCard,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react'
import { PageHeader } from '@/components/global'
import { useAuthStore } from '@/stores/auth-store'
import { SubmitButton } from '@/components/global/submit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const profileSchema = z.object({
  phone: z.string().optional(),
  batch: z.string().optional(),
  specialization: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export function SettingsModule() {
  const user = useAuthStore(state => state.user)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema as never),
    defaultValues: {
      phone: user?.phone || '',
      batch: user?.batch || '',
      specialization: user?.specialization || '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema as never),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (_data: ProfileFormData) => {
    try {
      // TODO: Implement PUT /me endpoint when available
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const onPasswordSubmit = async (_data: PasswordFormData) => {
    try {
      // TODO: Implement POST /auth/change-password endpoint when available
      toast.success('Password changed successfully')
      setShowPasswordDialog(false)
      passwordForm.reset()
    } catch {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences"
      />

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          <CardDescription>Your K48 identity information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <div className="flex items-center gap-2">
              <UserIcon className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">{user?.name}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Matricule</Label>
            <div className="flex items-center gap-2">
              <IdCard className="text-muted-foreground h-4 w-4" />
              <span className="font-mono">{user?.matricule}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span>{user?.email}</span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="+237600000000"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  {...form.register('batch')}
                  placeholder="2024"
                  disabled
                  className="cursor-not-allowed opacity-60"
                />
                <p className="text-muted-foreground text-xs">
                  Batch cannot be changed. Contact an admin if needed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  {...form.register('specialization')}
                  placeholder="Software Engineering"
                />
              </div>

              <SubmitButton type="submit">Save Changes</SubmitButton>
            </form>
          ) : (
            <>
              {user?.phone && (
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                </div>
              )}
              {user?.batch && (
                <div className="grid gap-2">
                  <Label>Batch</Label>
                  <span>{user.batch}</span>
                </div>
              )}
              {user?.specialization && (
                <div className="grid gap-2">
                  <Label>Specialization</Label>
                  <span>{user.specialization}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowPasswordDialog(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={open => {
          setShowPasswordDialog(open)
          if (!open) {
            passwordForm.reset()
            setShowCurrentPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...passwordForm.register('currentPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(v => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                    tabIndex={-1}
                    aria-label={
                      showCurrentPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...passwordForm.register('newPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                    tabIndex={-1}
                    aria-label={
                      showNewPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...passwordForm.register('confirmPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false)
                  passwordForm.reset()
                }}
              >
                Cancel
              </Button>
              <SubmitButton
                type="submit"
                isLoading={passwordForm.formState.isSubmitting}
              >
                Change Password
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
