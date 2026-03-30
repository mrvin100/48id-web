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
  Building2,
  UserCircle2,
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
    title: 'Traffic',
    href: ROUTES.TRAFFIC,
    icon: Activity,
    roles: [UserRole.ADMIN],
  },
  // ── OPERATOR ───────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'Users',
    href: ROUTES.USERS,
    icon: Users,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'Traffic',
    href: ROUTES.TRAFFIC,
    icon: Activity,
    roles: [UserRole.OPERATOR],
  },
  {
    title: 'API Key',
    href: ROUTES.API_KEY,
    icon: Key,
    roles: [UserRole.OPERATOR],
  },

  // ── STUDENT ────────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    href: ROUTES.STUDENT.DASHBOARD,
    icon: LayoutDashboard,
    roles: [UserRole.STUDENT],
  },
  {
    title: 'Profile',
    href: ROUTES.STUDENT.PROFILE,
    icon: UserCircle2,
    roles: [UserRole.STUDENT],
  },
  {
    title: 'Operators',
    href: ROUTES.STUDENT.OPERATORS,
    icon: Building2,
    roles: [UserRole.STUDENT],
  },
]

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigationConfig.filter(item => item.roles.includes(role))
}

/**
 * Get navigation items for student, with optional operator mode.
 * When in operator mode, returns operator navigation items with accountId
 * embedded as a query param so server pages can scope data to the account.
 *
 * @param isOperatorMode - Whether the student is viewing as an operator
 * @param operatorId - The selected operator account ID (required in operator mode)
 * @param isOwner - Whether the student is the owner of the operator account
 * @returns Navigation items for the current mode
 */
export function getNavigationForStudent(
  isOperatorMode: boolean = false,
  operatorId?: string | null,
  isOwner?: boolean
): NavigationItem[] {
  if (isOperatorMode && operatorId) {
    // Build operator nav items with accountId + isOwner embedded in the href
    return navigationConfig
      .filter(item => item.roles.includes(UserRole.OPERATOR))
      .map(item => {
        const needsOwner =
          item.href === ROUTES.API_KEY || item.href === ROUTES.USERS
        return {
          ...item,
          href: `${item.href}?accountId=${operatorId}${needsOwner ? `&isOwner=${isOwner ?? false}` : ''}`,
        }
      })
  }
  // Return student navigation by default
  return navigationConfig.filter(item => item.roles.includes(UserRole.STUDENT))
}
