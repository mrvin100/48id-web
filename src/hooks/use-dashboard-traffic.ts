import { useQuery } from '@tanstack/react-query'
import { dashboardTrafficApi } from '@/lib/api/dashboard-traffic'
import { dashboardTrafficKeys } from '@/lib/query-keys'

export function useDashboardTraffic() {
  return useQuery({
    queryKey: dashboardTrafficKeys.aggregated(),
    queryFn: dashboardTrafficApi.getAggregatedTraffic,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}
