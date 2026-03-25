/**
 * Navigation Configuration
 *
 * Single source of truth for sidebar navigation items per role.
 * Add/remove items here — AppSidebar reads this automatically.
 */

import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  Key,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { UserRole } from '@/types/auth.types'

export interface NavigationItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  roles: UserRole[]
}

export const navigationConfig: NavigationItem[] = [
  // ── ADMIN ──────────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'Users',
    href: ROUTES.USERS,
    icon: Users,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'CSV Import',
    href: ROUTES.CSV_IMPORT,
    icon: Upload,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'Audit Logs',
    href: ROUTES.AUDIT,
    icon: FileText,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'API Keys',
    href: ROUTES.API_KEYS,
    icon: Key,
    roles: [UserRole.ADMIN],
  },

  // ── OPERATOR ───────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    href: ROUTES.OPERATOR.DASHBOARD,
    icon: LayoutDashboard,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'Users',
    href: ROUTES.OPERATOR.USERS,
    icon: Users,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'Audit Logs',
    href: ROUTES.OPERATOR.AUDIT,
    icon: FileText,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'Traffic',
    href: ROUTES.OPERATOR.TRAFFIC,
    icon: Activity,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'API Key',
    href: ROUTES.OPERATOR.API_KEY,
    icon: Key,
    roles: [UserRole.OPERATOR],
  },
]

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigationConfig.filter(item => item.roles.includes(role))
}
