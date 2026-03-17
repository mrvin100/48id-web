'use client'

/**
 * Logout Module Component
 *
 * Provides logout functionality for the 48ID Admin Portal.
 * Can be used as a button component or standalone logout handler.
 *
 * Requirements: 1.5, 9.2
 */

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { ROUTES } from '@/lib/routes'

interface LogoutModuleProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  children?: React.ReactNode
  className?: string
}

export function LogoutModule({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  children,
  className,
}: LogoutModuleProps) {
  const router = useRouter()
  const { logout, isLoading } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect to login page after successful logout
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, redirect to login for security
      router.push(ROUTES.LOGIN)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || (size !== 'icon' && 'Sign Out')}
    </Button>
  )
}
