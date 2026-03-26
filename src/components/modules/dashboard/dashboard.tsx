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
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Users,
  Activity,
  UserCheck,
  TrendingUp,
  Calendar,
  AlertCircle,
  Clock as ClockIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader } from '@/components/global'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/use-dashboard'
import { useDashboardTraffic } from '@/hooks/use-dashboard-traffic'
import { ROUTES } from '@/lib/routes'
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

// Format ISO date for display
function fmt(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

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

// Clock component to avoid re-rendering entire dashboard every second
function Clock() {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <ClockIcon className="h-4 w-4" />
      <span>Last updated: {currentTime || 'Loading...'}</span>
    </div>
  )
}

export function DashboardModule() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab = tabParam === 'traffic' ? 'traffic' : 'overview'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`?${params.toString()}`)
  }

  const { metrics, loginActivity, recentActivity, isLoading, isError, error } =
    useDashboard()

  const {
    data: trafficData,
    isLoading: trafficLoading,
    isError: trafficError,
  } = useDashboardTraffic()

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
        <Clock />
      </PageHeader>

      {/* Backend Status Alert */}
      {isError && (
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

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? '...'
                      : (metrics?.totalUsers?.toLocaleString() ?? '0')}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    No comparison data
                  </p>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <UserCheck className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? '...'
                      : (metrics?.activeUsers?.toLocaleString() ?? '0')}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    No comparison data
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
                    No comparison data
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
                    No comparison data
                  </p>
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
                                : activity.action
                                      .toLowerCase()
                                      .includes('error')
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
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
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          {trafficLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}
          {trafficError && (
            <p className="text-destructive py-8 text-center text-sm">
              Failed to load traffic data.
            </p>
          )}
          {!trafficLoading &&
            !trafficError &&
            !trafficData?.accounts?.length && (
              <p className="text-muted-foreground py-12 text-center text-sm">
                No operator accounts with traffic yet.
              </p>
            )}
          {!trafficLoading &&
            !trafficError &&
            !!trafficData?.accounts?.length && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>API Key Calls (total)</TableHead>
                    <TableHead>API Key Calls (24h)</TableHead>
                    <TableHead>Last API Call</TableHead>
                    <TableHead>Member Actions (total)</TableHead>
                    <TableHead>Member Actions (24h)</TableHead>
                    <TableHead>Last Member Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trafficData.accounts.map(account => (
                    <TableRow
                      key={account.accountId}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(
                          ROUTES.OPERATOR_ACCOUNT_TRAFFIC(account.accountId)
                        )
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          router.push(
                            ROUTES.OPERATOR_ACCOUNT_TRAFFIC(account.accountId)
                          )
                        }
                      }}
                      tabIndex={0}
                      aria-label={`View traffic for ${account.accountName}`}
                    >
                      <TableCell className="font-medium">
                        {account.accountName}
                      </TableCell>
                      <TableCell>{account.apiKeyTraffic.totalCalls}</TableCell>
                      <TableCell>{account.apiKeyTraffic.last24h}</TableCell>
                      <TableCell>
                        {fmt(account.apiKeyTraffic.lastCalledAt)}
                      </TableCell>
                      <TableCell>
                        {account.memberActivity.totalActions}
                      </TableCell>
                      <TableCell>{account.memberActivity.last24h}</TableCell>
                      <TableCell>
                        {fmt(account.memberActivity.lastActionAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
