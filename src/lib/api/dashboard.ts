/**
 * Dashboard API Layer
 *
 * API functions for dashboard-related operations.
 * Pure functions that handle HTTP requests and response transformations.
 */

import { apiClient } from './client'

// Types
export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  activeSessions: number
  pendingActivations: number
  suspendedUsers: number
  systemHealth?: 'operational' | 'degraded' | 'down'
}

export interface LoginActivityData {
  day: string
  logins: number
}

export interface LoginActivityResponse {
  data: LoginActivityData[]
}

export interface RecentActivityData {
  action: string
  user: string
  ipAddress: string
  timestamp: string
}

export interface RecentActivityResponse {
  activities: RecentActivityData[]
}

// ── Admin Traffic (AggregatedTrafficView from backend) ─────────────────────

export interface ApiKeyTraffic {
  totalCalls: number
  last24h: number
  lastCalledAt: string | null
}

export interface MemberActivity {
  totalActions: number
  last24h: number
  lastActionAt: string | null
}

export interface AccountTraffic {
  accountId: string
  accountName: string
  apiKeyTraffic: ApiKeyTraffic
  memberActivity: MemberActivity
}

export interface AggregatedTrafficView {
  accounts: AccountTraffic[]
  generatedAt: string
}

// API Functions
export const dashboardApi = {
  /**
   * Get dashboard overview metrics
   */
  getMetrics: (): Promise<DashboardMetrics> =>
    apiClient.get('dashboard/metrics').json<DashboardMetrics>(),

  /**
   * Get 7-day login activity data for charts
   */
  getLoginActivity: (): Promise<LoginActivityResponse> =>
    apiClient.get('dashboard/login-activity').json<LoginActivityResponse>(),

  /**
   * Get recent activity events
   */
  getRecentActivity: (): Promise<RecentActivityResponse> =>
    apiClient.get('dashboard/recent-activity').json<RecentActivityResponse>(),

  /**
   * Get aggregated traffic stats across all operator accounts (ADMIN only)
   */
  getAggregatedTraffic: (): Promise<AggregatedTrafficView> =>
    apiClient.get('dashboard/traffic').json<AggregatedTrafficView>(),
}

export default dashboardApi
