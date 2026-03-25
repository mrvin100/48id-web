import { apiClient } from './client'

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

export interface AggregatedTrafficResponse {
  accounts: AccountTraffic[]
  generatedAt: string
}

export const dashboardTrafficApi = {
  getAggregatedTraffic: (): Promise<AggregatedTrafficResponse> =>
    apiClient.get('admin/dashboard/traffic').json<AggregatedTrafficResponse>(),
}
