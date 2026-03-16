// Dashboard service - implementation coming in Sprint 2

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  pendingActivations: number
  recentLogins: number
  systemHealth: HealthStatus
}

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED'
  components: Record<string, ComponentHealth>
}

export interface ComponentHealth {
  status: 'UP' | 'DOWN'
  details?: Record<string, unknown>
}

export class DashboardService {
  async getMetrics(): Promise<DashboardMetrics> {
    throw new Error(
      'DashboardService.getMetrics - implementation coming in Sprint 2'
    )
  }

  async getSystemHealth(): Promise<HealthStatus> {
    throw new Error(
      'DashboardService.getSystemHealth - implementation coming in Sprint 2'
    )
  }
}

export const dashboardService = new DashboardService()
