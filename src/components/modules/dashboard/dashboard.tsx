'use client'

/**
 * Dashboard Module Component
 *
 * Main dashboard interface for the 48ID Admin Portal.
 * Displays key metrics and system status.
 *
 * Requirements: 2.1, 2.2, 2.3
 */

import { Users, Activity, UserCheck, Server, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader } from '@/components/page-header'

export function DashboardModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the 48ID Admin Portal"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-muted-foreground text-xs">Coming in Sprint 2</p>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-muted-foreground text-xs">Real-time tracking</p>
          </CardContent>
        </Card>

        {/* Pending Activations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Activations
            </CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-muted-foreground text-xs">
              User activation workflow
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">UP</div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="border-green-600 text-green-600"
              >
                Operational
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Notice */}
      <Alert>
        <TrendingUp />
        <AlertTitle>Dashboard Development</AlertTitle>
        <AlertDescription>
          Additional dashboard features including charts, recent activity, and
          system alerts will be implemented in Sprint 2. The current metrics are
          placeholders for the upcoming functionality.
        </AlertDescription>
      </Alert>
    </div>
  )
}
