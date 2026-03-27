import { ReactNode } from 'react'
import { DashboardShell } from '@/components/layouts/dashboard-shell'
import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'

interface DashboardLayoutProps {
  readonly children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const role = await getServerUserRole()
  const portalTitle =
    role === UserRole.ADMIN
      ? '48ID Admin Portal'
      : role === UserRole.OPERATOR
        ? '48ID Operator Portal'
        : '48ID Student Portal'

  return <DashboardShell portalTitle={portalTitle}>{children}</DashboardShell>
}
