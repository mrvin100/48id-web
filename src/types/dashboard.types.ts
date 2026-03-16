// Dashboard types - will be expanded in Sprint 2

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  pendingActivations: number
  suspendedUsers: number
  recentLogins: number
  todayRegistrations: number
  systemHealth: HealthStatus
  lastUpdated: string
}

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED'
  components: Record<string, ComponentHealth>
  uptime: number
  lastCheck: string
}

export interface ComponentHealth {
  status: 'UP' | 'DOWN'
  responseTime?: number
  details?: Record<string, unknown>
  lastCheck: string
}

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
  }
}

export interface UserActivityMetrics {
  dailyLogins: Array<{
    date: string
    count: number
  }>
  weeklyRegistrations: Array<{
    week: string
    count: number
  }>
  topActions: Array<{
    action: string
    count: number
  }>
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
  requiresPermission?: string
}
