'use client'

/**
 * Dashboard Module Component
 *
 * Main dashboard interface for the 48ID Admin Portal.
 * Displays key metrics, charts, and system status.
 *
 * Requirements: WEB-03-01, WEB-03-02, WEB-03-03, WEB-03-04
 */

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

// Fallback data for user status distribution (static chart data)
const fallbackUserStatus = [
  { status: 'Active', count: 1247, fill: 'var(--color-active)' },
  { status: 'Inactive', count: 234, fill: 'var(--color-inactive)' },
  { status: 'Pending', count: 89, fill: 'var(--color-pending)' },
  { status: 'Locked', count: 12, fill: 'var(--color-locked)' },
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
  const { metrics, loginActivity, recentActivity, isLoading, isError, error } =
    useDashboard()

  // Determine backend status
  const backendStatus = isError ? 'error' : metrics ? 'available' : 'loading'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to the 48ID Admin Portal"
      >
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
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
                  data={fallbackUserStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {fallbackUserStatus.map((entry, index) => (
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
