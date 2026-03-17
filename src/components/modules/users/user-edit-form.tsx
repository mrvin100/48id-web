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
import * as z from 'zod/v4'
import { User } from '@/types/auth.types'
import { useUpdateUser } from '@/hooks/use-users'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

      toast.success('User profile updated successfully')
      setIsEditing(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to update user profile')
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Profile Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <div className="text-sm">{user.name || 'N/A'}</div>
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <div className="text-sm">{user.email}</div>
          </div>

          <div className="grid gap-2">
            <Label>Phone</Label>
            <div className="text-sm">{user.phone || 'N/A'}</div>
          </div>

          <div className="grid gap-2">
            <Label>Batch</Label>
            <div className="text-sm">{user.batch || 'N/A'}</div>
          </div>

          <div className="grid gap-2">
            <Label>Specialization</Label>
            <div className="text-sm">{user.specialization || 'N/A'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Edit Profile</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={updateUser.isPending}>
            {updateUser.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            {...form.register('name')}
            disabled={updateUser.isPending}
            placeholder="Full name"
          />
          {form.formState.errors.name && (
            <span className="text-destructive text-sm">
              {form.formState.errors.name.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            {...form.register('email')}
            disabled={updateUser.isPending}
            type="email"
            placeholder="email@example.com"
          />
          {form.formState.errors.email && (
            <span className="text-destructive text-sm">
              {form.formState.errors.email.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input
            {...form.register('phone')}
            disabled={updateUser.isPending}
            placeholder="+237600000000"
          />
          {form.formState.errors.phone && (
            <span className="text-destructive text-sm">
              {form.formState.errors.phone.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Batch</Label>
          <Input
            {...form.register('batch')}
            disabled={updateUser.isPending}
            placeholder="2024"
          />
          {form.formState.errors.batch && (
            <span className="text-destructive text-sm">
              {form.formState.errors.batch.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Specialization</Label>
          <Input
            {...form.register('specialization')}
            disabled={updateUser.isPending}
            placeholder="Software Engineering"
          />
          {form.formState.errors.specialization && (
            <span className="text-destructive text-sm">
              {form.formState.errors.specialization.message}
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Matricule</Label>
          <Input value={user.matricule} disabled readOnly />
          <span className="text-muted-foreground text-xs">
            Matricule cannot be changed after account creation
          </span>
        </div>
      </div>
    </form>
  )
}
