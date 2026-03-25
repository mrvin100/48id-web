'use client'

/**
 * Operator Dashboard Module
 *
 * Overview page for the operator role.
 * WEB-S4-FE-06
 */

import { PageHeader } from '@/components/global'
import { useOperatorUsers, useOperatorTraffic } from '@/hooks/use-operator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Key } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function OperatorDashboardModule() {
  const { data: usersData, isLoading: usersLoading } = useOperatorUsers()
  const { data: trafficData, isLoading: trafficLoading } = useOperatorTraffic()

  const isLoading = usersLoading || trafficLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your operator account"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {usersData?.totalElements ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              API Calls (total)
            </CardTitle>
            <Key className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {trafficData?.apiKeyCalls?.length ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Actions</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {trafficData?.memberActions?.length ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
