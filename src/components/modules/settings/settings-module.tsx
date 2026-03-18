'use client'

/**
 * Settings Module Component
 *
 * User profile and settings management.
 *
 * Requirements: WEB-10-01, WEB-10-02, WEB-10-03
 */

import { useState } from 'react'
import { PageHeader } from '@/components/global'
import { useAuthStore } from '@/stores/auth-store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod/v4'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Moon, Sun, User as UserIcon, Mail, Phone, IdCard } from 'lucide-react'

const profileSchema = z.object({
  phone: z.string().optional(),
  batch: z.string().optional(),
  specialization: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function SettingsModule() {
  const user = useAuthStore((state) => state.user)
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema as never),
    defaultValues: {
      phone: user?.phone || '',
      batch: user?.batch || '',
      specialization: user?.specialization || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    // TODO: Implement PUT /me endpoint
    toast.success('Profile updated successfully')
    setIsEditing(false)
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
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  {...form.register('specialization')}
                  placeholder="Software Engineering"
                />
              </div>

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
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

      {/* Appearance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize how the portal looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-muted-foreground text-sm">
                Choose between light and dark mode
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
