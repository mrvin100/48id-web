/**
 * Operator Layout
 *
 * Identical layout to (dashboard) — same sidebar, same structure.
 * Only the sidebar nav items differ (role-driven in AppSidebar).
 */

import { ReactNode } from 'react'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface OperatorLayoutProps {
  children: ReactNode
}

export default function OperatorLayout({ children }: OperatorLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="bg-sidebar-border h-4 w-px" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">48ID Operator Portal</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
