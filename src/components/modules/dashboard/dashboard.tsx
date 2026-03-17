'use client'

/**
 * Dashboard Module Component
 *
 * Main dashboard interface for the 48ID Admin Portal.
 * Displays key metrics, charts, and system status.
 *
 * Requirements: WEB-03-01, WEB-03-02, WEB-03-03, WEB-03-04
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
  AlertCircle,
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
  Cell,
} from 'recharts'
import { useDashboard } from '@/hooks/use-dashboard'

// Chart configuration with explicit colors
const chartConfig = {
  logins: {
    label: 'Logins',
    color: '#2563eb', // blue-600
  },
  active: {
    label: 'Active',
    color: '#22c55e', // green-500
  },
  inactive: {
    label: 'Inactive',
    color: '#6b7280', // gray-500
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b', // amber-500
  },
  suspended: {
    label: 'Suspended',
    color: '#ef4444', // red-500
  },
} satisfies ChartConfig

// Explicit colors for pie chart segments
const PIE_CHART_COLORS = ['#22c55e', '#6b7280', '#f59e0b', '#ef4444']

export function DashboardModule() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const { metrics, loginActivity, recentActivity, isLoading, isError, error } =
    useDashboard()

  // Fix hydration error by using client-side time display
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }

    updateTime() // Set initial time
    const interval = setInterval(updateTime, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  // Determine backend status
  const backendStatus = isError ? 'error' : metrics ? 'available' : 'loading'

  // Create user status distribution data from real backend metrics with explicit colors
  const userStatusData = metrics
    ? [
        {
          status: 'Active',
          count: metrics.activeUsers,
          fill: PIE_CHART_COLORS[0],
        },
        {
          status: 'Inactive',
          count: Math.max(
            0,
            metrics.totalUsers -
              metrics.activeUsers -
              metrics.pendingActivations -
              metrics.suspendedUsers
          ),
          fill: PIE_CHART_COLORS[1],
        },
        {
          status: 'Pending',
          count: metrics.pendingActivations,
          fill: PIE_CHART_COLORS[2],
        },
        {
          status: 'Suspended',
          count: metrics.suspendedUsers,
          fill: PIE_CHART_COLORS[3],
        },
      ]
    : [
        { status: 'Active', count: 0, fill: PIE_CHART_COLORS[0] },
        { status: 'Inactive', count: 0, fill: PIE_CHART_COLORS[1] },
        { status: 'Pending', count: 0, fill: PIE_CHART_COLORS[2] },
        { status: 'Suspended', count: 0, fill: PIE_CHART_COLORS[3] },
      ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the 48ID Admin Portal"
      >
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>Last updated: {currentTime || 'Loading...'}</span>
        </div>
      </PageHeader>

      {/* Backend Status Alert */}
      {backendStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to backend services. Please ensure the backend
            server is running on localhost:8080.
            <br />
            <span className="text-muted-foreground text-sm">
              Error: {error?.message}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : (metrics?.totalUsers?.toLocaleString() ?? '0')}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : (metrics?.activeUsers?.toLocaleString() ?? '0')}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="text-green-600">+8%</span> from last month
            </p>
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
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : (metrics?.activeSessions?.toLocaleString() ?? '0')}
            </div>
            <p className="text-muted-foreground text-xs">
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
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : (metrics?.pendingActivations?.toLocaleString() ?? '0')}
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="text-orange-600">+3</span> new today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Server className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? '...' : backendStatus === 'available' ? 'UP' : 'DOWN'}
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={
                backendStatus === 'available'
                  ? 'border-green-600 text-green-600'
                  : 'border-red-600 text-red-600'
              }
            >
              {backendStatus === 'available' ? 'Operational' : 'Error'}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
              <BarChart data={loginActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="logins" fill="#2563eb" radius={4} />
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
            {/* Legend below chart */}
            <div className="mt-4 flex flex-wrap gap-4">
              {userStatusData.map((item, index) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm">
                    {item.status}: {item.count}
                  </span>
                </div>
              ))}
            </div>
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.action.toLowerCase().includes('login')
                          ? 'bg-green-500'
                          : activity.action.toLowerCase().includes('error')
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.user} • {activity.ipAddress}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                {isLoading
                  ? 'Loading recent activity...'
                  : isError
                    ? `Error: ${error?.message}`
                    : 'No recent activity'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Status</AlertTitle>
        <AlertDescription>
          {backendStatus === 'available'
            ? 'All systems are operational. Next maintenance window is scheduled for Sunday, 2:00 AM - 4:00 AM UTC.'
            : 'System is experiencing issues. Please check backend connectivity.'}
        </AlertDescription>
      </Alert>
    </div>
  )
}
