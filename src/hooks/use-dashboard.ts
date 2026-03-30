/**
 * Dashboard Hooks
 *
 * TanStack Query hooks for dashboard data fetching and mutations.
 * Provides caching, background updates, and optimistic updates.
 */

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'
import { dashboardKeys } from '@/lib/query-keys'
export type { AggregatedTrafficView, AccountTraffic } from '@/lib/api/dashboard'

/**
 * Hook to fetch dashboard metrics with auto-refresh
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: dashboardApi.getMetrics,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true,
  })
}

/**
 * Hook to fetch login activity data for charts
 */
export function useLoginActivity() {
  return useQuery({
    queryKey: dashboardKeys.loginActivity(),
    queryFn: dashboardApi.getLoginActivity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Hook to fetch recent activity events
 */
export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: dashboardApi.getRecentActivity,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true,
  })
}

/**
 * Hook to fetch aggregated traffic stats across all operator accounts (ADMIN only)
 */
export function useAdminTraffic() {
  return useQuery({
    queryKey: dashboardKeys.traffic(),
    queryFn: dashboardApi.getAggregatedTraffic,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })
}

/**
 * Composed hook for all dashboard data
 */
export function useDashboard() {
  const metricsQuery = useDashboardMetrics()
  const loginActivityQuery = useLoginActivity()
  const recentActivityQuery = useRecentActivity()

  return {
    metrics: metricsQuery.data,
    loginActivity: loginActivityQuery.data?.data ?? [],
    recentActivity: recentActivityQuery.data?.activities ?? [],

    isLoading:
      metricsQuery.isLoading ||
      loginActivityQuery.isLoading ||
      recentActivityQuery.isLoading,
    isError:
      metricsQuery.isError ||
      loginActivityQuery.isError ||
      recentActivityQuery.isError,
    error:
      metricsQuery.error ||
      loginActivityQuery.error ||
      recentActivityQuery.error,

    refetch: () => {
      metricsQuery.refetch()
      loginActivityQuery.refetch()
      recentActivityQuery.refetch()
    },
  }
}
