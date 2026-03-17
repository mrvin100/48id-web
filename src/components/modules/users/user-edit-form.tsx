'use client'

/**
 * User Edit Form Component
 *
 * Inline form for editing user profile information.
 * Used within the UserDetailSheet Profile tab.
 *
 * Requirements: WEB-04-03
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User } from '@/types/auth.types'
import { useUpdateUser } from '@/hooks/use-users'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  IdCard,
  Pencil,
  Check,
  X,
} from 'lucide-react'

// Form validation schema
const userEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  batch: z.string().optional(),
  specialization: z.string().optional(),
})

type UserEditFormData = z.infer<typeof userEditSchema>

interface UserEditFormProps {
  user: User
  onSuccess?: () => void
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateUser = useUpdateUser()

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema as any),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      batch: user.batch || '',
      specialization: user.specialization || '',
    },
  })

  const onSubmit = async (data: UserEditFormData) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          batch: data.batch || undefined,
          specialization: data.specialization || undefined,
        },
      })

      toast.success('Profile updated successfully')
      setIsEditing(false)
      form.reset(data)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        {/* Display Mode Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Profile Information
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8"
          >
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Edit
          </Button>
        </div>

        {/* Profile Fields */}
        <div className="grid gap-4">
          <div className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-muted-foreground/30 transition-colors">
            <UserIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex flex-1 flex-col gap-0.5">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium">{user.name || 'N/A'}</p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-muted-foreground/30 transition-colors">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex flex-1 flex-col gap-0.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-muted-foreground/30 transition-colors">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-1 flex-col gap-0.5">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
            </div>
          )}

          {user.batch && (
            <div className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-muted-foreground/30 transition-colors">
              <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-1 flex-col gap-0.5">
                <Label className="text-xs text-muted-foreground">Batch</Label>
                <p className="text-sm font-medium">{user.batch}</p>
              </div>
            </div>
          )}

          {user.specialization && (
            <div className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-muted-foreground/30 transition-colors">
              <IdCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-1 flex-col gap-0.5">
                <Label className="text-xs text-muted-foreground">
                  Specialization
                </Label>
                <p className="text-sm font-medium">{user.specialization}</p>
              </div>
            </div>
          )}
        </div>

        {/* Matricule (Always Read-only) */}
        <div className="group flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
          <IdCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex flex-1 flex-col gap-0.5">
            <Label className="text-xs text-muted-foreground">Matricule</Label>
            <p className="text-sm font-mono">{user.matricule}</p>
            <p className="text-xs text-muted-foreground">
              Matricule cannot be changed after account creation
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Edit Mode Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Edit Profile
        </h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false)
              form.reset()
            }}
            className="h-8"
            disabled={updateUser.isPending}
          >
            <X className="h-3.5 w-3.5 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8"
            disabled={updateUser.isPending}
          >
            <Check className="h-3.5 w-3.5 mr-2" />
            {updateUser.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-name"
              {...form.register('name')}
              disabled={updateUser.isPending}
              placeholder="Full name"
              className="pl-9"
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-email"
              {...form.register('email')}
              disabled={updateUser.isPending}
              type="email"
              placeholder="email@example.com"
              className="pl-9"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-phone"
              {...form.register('phone')}
              disabled={updateUser.isPending}
              placeholder="+237600000000"
              className="pl-9"
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-batch">Batch</Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-batch"
              {...form.register('batch')}
              disabled={updateUser.isPending}
              placeholder="2024"
              className="pl-9"
            />
          </div>
          {form.formState.errors.batch && (
            <p className="text-sm text-destructive">
              {form.formState.errors.batch.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-specialization">Specialization</Label>
          <div className="relative">
            <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-specialization"
              {...form.register('specialization')}
              disabled={updateUser.isPending}
              placeholder="Software Engineering"
              className="pl-9"
            />
          </div>
          {form.formState.errors.specialization && (
            <p className="text-sm text-destructive">
              {form.formState.errors.specialization.message}
            </p>
          )}
        </div>

        {/* Matricule (Always Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="edit-matricule">Matricule</Label>
          <div className="relative">
            <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="edit-matricule"
              value={user.matricule}
              disabled
              readOnly
              className="pl-9 bg-muted/50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Matricule cannot be changed after account creation
          </p>
        </div>
      </div>
    </form>
  )
}
