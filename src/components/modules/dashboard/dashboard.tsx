'use client'

/**
 * Dashboard Module Component
 *
 * Main dashboard interface for the 48ID Admin Portal.
 * Displays key metrics, charts, and system status.
 *
 * Requirements: 2.1, 2.2, 2.3
 */

import { useState, useEffect } from 'react'
import { 
  Users, 
  Activity, 
  UserCheck, 
  Server, 
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader } from '@/components/global'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock data for charts
const loginActivityData = [
  { day: 'Mon', logins: 45 },
  { day: 'Tue', logins: 52 },
  { day: 'Wed', logins: 38 },
  { day: 'Thu', logins: 61 },
  { day: 'Fri', logins: 55 },
  { day: 'Sat', logins: 23 },
  { day: 'Sun', logins: 18 },
]

const userStatusData = [
  { status: 'Active', count: 1247, fill: 'var(--color-active)' },
  { status: 'Inactive', count: 234, fill: 'var(--color-inactive)' },
  { status: 'Pending', count: 89, fill: 'var(--color-pending)' },
  { status: 'Locked', count: 12, fill: 'var(--color-locked)' },
]

const recentActivity = [
  {
    id: 1,
    action: 'User login',
    user: 'john.doe@example.com',
    timestamp: '2 minutes ago',
    status: 'success',
  },
  {
    id: 2,
    action: 'Password reset',
    user: 'jane.smith@example.com',
    timestamp: '5 minutes ago',
    status: 'info',
  },
  {
    id: 3,
    action: 'Account locked',
    user: 'bob.wilson@example.com',
    timestamp: '12 minutes ago',
    status: 'warning',
  },
  {
    id: 4,
    action: 'New user registration',
    user: 'alice.brown@example.com',
    timestamp: '18 minutes ago',
    status: 'success',
  },
]

const chartConfig = {
  logins: {
    label: 'Logins',
    color: 'hsl(var(--chart-1))',
  },
  active: {
    label: 'Active',
    color: 'hsl(var(--chart-1))',
  },
  inactive: {
    label: 'Inactive',
    color: 'hsl(var(--chart-2))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-3))',
  },
  locked: {
    label: 'Locked',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function DashboardModule() {
  const [metrics, setMetrics] = useState({
    totalUsers: 1582,
    activeSessions: 234,
    pendingActivations: 89,
    systemHealth: 'operational',
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading metrics
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the 48ID Admin Portal"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </PageHeader>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : metrics.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : metrics.activeSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        {/* Pending Activations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Activations
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : metrics.pendingActivations}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">+3</span> new today
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : 'UP'}
            </div>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Login Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Login Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={loginActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="logins" fill="var(--color-logins)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={userStatusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.status === 'success'
                        ? 'bg-green-500'
                        : activity.status === 'warning'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Status</AlertTitle>
        <AlertDescription>
          All systems are operational. Next maintenance window is scheduled for
          Sunday, 2:00 AM - 4:00 AM UTC.
        </AlertDescription>
      </Alert>
    </div>
  )
}
