import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* AppShell component will be implemented in Sprint 2 */}
      <div className="flex">
        {/* Sidebar placeholder */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-4">
            <h1 className="text-lg font-semibold">48ID Admin</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}
