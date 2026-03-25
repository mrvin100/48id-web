/**
 * Operator Hooks
 *
 * TanStack Query hooks for the operator module.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { operatorApi } from '@/lib/api/operator'
import { operatorKeys } from '@/lib/query-keys'

export function useOperatorUsers(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: operatorKeys.users(),
    queryFn: () => operatorApi.getUsers(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useOperatorAuditLog(params?: {
  eventType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: [...operatorKeys.auditLog(), params],
    queryFn: () => operatorApi.getAuditLog(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useOperatorTraffic() {
  return useQuery({
    queryKey: operatorKeys.traffic(),
    queryFn: operatorApi.getTraffic,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
  })
}

export function useOperatorApiKey() {
  return useQuery({
    queryKey: operatorKeys.apiKey(),
    queryFn: operatorApi.getApiKey,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: operatorApi.createApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: operatorKeys.apiKey() }),
  })
}

export function useRotateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: operatorApi.rotateApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: operatorKeys.apiKey() }),
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: operatorApi.deleteApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: operatorKeys.apiKey() }),
  })
}
