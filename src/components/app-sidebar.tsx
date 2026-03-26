/**
 * App Sidebar Component
 *
 * Unified sidebar for all roles. Navigation items are driven by
 * getNavigationForRole() — same layout, different tabs per role.
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/routes'
import { getNavigationForRole } from '@/lib/navigation'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/auth.types'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const role = (Array.isArray(user?.roles)
    ? user.roles.includes('OPERATOR')
      ? 'OPERATOR'
      : user.roles.includes('ADMIN')
        ? 'ADMIN'
        : 'STUDENT'
    : 'STUDENT') as UserRole

  const navItems = role ? getNavigationForRole(role) : []

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push(ROUTES.LOGIN)
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-sm font-bold">48</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">48ID Portal</span>
            <span className="text-muted-foreground truncate text-xs capitalize">
              {role?.toLowerCase() ?? ''}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="h-4 w-4" />
              <span className="truncate">
                {user?.firstName} {user?.lastName}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
