/**
 * App Sidebar Component
 *
 * Unified sidebar for all roles. Navigation items are driven by
 * getNavigationForRole() / getNavigationForStudent() — same layout,
 * different tabs per role.
 *
 * For STUDENT users:
 * - Default: shows student tabs (Dashboard, Profile, Operators)
 * - Operator mode: tabs are COMPLETELY REPLACED by operator tabs
 *   (Dashboard, Users, Audit, Traffic, API Key) with accountId in URLs.
 *   A "Back to Student View" button in the footer exits operator mode.
 *
 * Navigation is reactive: useOperatorContext() is a Zustand store, so the
 * sidebar re-renders automatically whenever isOperatorMode or selectedOperator
 * changes — no router refresh needed.
 */

'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Building2, ArrowLeft } from 'lucide-react'
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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/routes'
import { getNavigationForRole, getNavigationForStudent } from '@/lib/navigation'
import { useAuthStore } from '@/stores/auth-store'
import {
  useOperatorContext,
  useOperatorHydrated,
} from '@/stores/operator-store'
import { UserRole } from '@/types/auth.types'
import { resolvePrimaryRole } from '@/lib/role-utils'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  // Wait for sessionStorage hydration so isOperatorMode reflects persisted state.
  // Until hydrated, we show student nav (safe default) to avoid a flash of wrong tabs.
  const hydrated = useOperatorHydrated()
  const { selectedOperator, isOperatorMode, clearOperator } =
    useOperatorContext()

  const role: UserRole = resolvePrimaryRole(user?.roles)
  const isStudent = role === UserRole.STUDENT

  // Effective operator mode: only active once hydrated AND store says so
  const effectiveOperatorMode = hydrated && isOperatorMode && !!selectedOperator

  // Compute nav items:
  // - Non-student roles: static nav from role config
  // - Students not in operator mode: student tabs
  // - Students in operator mode: operator tabs with accountId embedded in URLs
  const navItems = isStudent
    ? getNavigationForStudent(
        effectiveOperatorMode,
        selectedOperator?.id,
        selectedOperator?.role === 'OWN'
      )
    : role
      ? getNavigationForRole(role)
      : []

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push(ROUTES.LOGIN)
    }
  }

  const handleExitOperatorMode = () => {
    clearOperator()
    // Navigate to dashboard — page.tsx will show StudentDashboardWrapper which
    // now renders StudentDashboardModule since isOperatorMode is false
    router.push(ROUTES.DASHBOARD)
  }

  return (
    <Sidebar variant="inset">
      {/* ── Header ── */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-sm font-bold">48</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">48ID Portal</span>
            <span className="text-muted-foreground truncate text-xs capitalize">
              {effectiveOperatorMode
                ? `Operator · ${selectedOperator?.role === 'OWN' ? 'Owner' : 'Collaborator'}`
                : (role?.toLowerCase() ?? '')}
            </span>
          </div>
        </div>

        {/* Operator account badge — shown in header when in operator mode */}
        {effectiveOperatorMode && selectedOperator && (
          <div className="bg-primary/5 border-primary/20 mx-2 mb-1 flex items-center gap-2 rounded-md border px-3 py-2">
            <Building2 className="text-primary h-3.5 w-3.5 shrink-0" />
            <span className="text-primary truncate text-xs font-medium">
              {selectedOperator.name}
            </span>
          </div>
        )}
      </SidebarHeader>

      {/* ── Nav Items ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {effectiveOperatorMode ? 'Operator' : 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const Icon = item.icon
                // Strip ?accountId=... query params before comparing with pathname
                const hrefPath = item.href.split('?')[0]
                const isActive = pathname === hrefPath
                // Use full href as key so duplicate paths (e.g. /dashboard for both
                // student and operator Dashboard items) don't collide in React's reconciler
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

      {/* ── Footer ── */}
      <SidebarFooter>
        <SidebarMenu>
          {/* "Back to Student View" — only shown in operator mode */}
          {effectiveOperatorMode && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleExitOperatorMode}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Student View</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator />
            </>
          )}

          {/* User info */}
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="h-4 w-4" />
              <span className="truncate">
                {user?.firstName} {user?.lastName}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
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
