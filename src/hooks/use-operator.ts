/**
 * Operator Hooks — all account-scoped per backend contract.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { operatorApi } from '@/lib/api/operator'
import { operatorKeys } from '@/lib/query-keys'

export function useOperatorAccounts() {
  return useQuery({
    queryKey: operatorKeys.accounts(),
    queryFn: operatorApi.getAccounts,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateOperatorAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: operatorApi.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.accounts() }),
  })
}

export function useDeleteOperatorAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (accountId: string) => operatorApi.deleteAccount(accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.accounts() }),
  })
}

export function useInviteOperatorMember(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (matricule: string) => operatorApi.inviteMember(accountId, matricule),
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.accounts() }),
  })
}

export function useRemoveOperatorMember(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => operatorApi.removeMember(accountId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.accounts() }),
  })
}

export function useOperatorUsers(accountId: string, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: operatorKeys.users(accountId),
    queryFn: () => operatorApi.getUsers(accountId, params),
    staleTime: 2 * 60 * 1000,
    enabled: !!accountId,
  })
}

export function useOperatorAuditLog(accountId: string, params?: {
  eventType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: [...operatorKeys.auditLog(accountId), params],
    queryFn: () => operatorApi.getAuditLog(accountId, params),
    staleTime: 2 * 60 * 1000,
    enabled: !!accountId,
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

export function useOperatorApiKey(accountId: string) {
  return useQuery({
    queryKey: operatorKeys.apiKey(accountId),
    queryFn: () => operatorApi.getApiKey(accountId),
    staleTime: 5 * 60 * 1000,
    enabled: !!accountId,
  })
}

export function useCreateApiKey(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { applicationName: string; description?: string }) =>
      operatorApi.createApiKey(accountId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.apiKey(accountId) }),
  })
}

export function useRotateApiKey(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => operatorApi.rotateApiKey(accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.apiKey(accountId) }),
  })
}

export function useDeleteApiKey(accountId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => operatorApi.deleteApiKey(accountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.apiKey(accountId) }),
  })
}
