/**
 * API Keys Hooks
 *
 * TanStack Query hooks for API key management.
 * Provides caching and mutations for CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysApi, type CreateApiKeyRequest } from '@/lib/api/api-keys'
import { apiKeysKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

/**
 * Hook to fetch API keys list
 */
export function useApiKeys() {
  return useQuery({
    queryKey: apiKeysKeys.list(),
    queryFn: apiKeysApi.getApiKeys,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create API key
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeysApi.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.all })
    },
  })
}

/**
 * Hook to rotate API key
 */
export function useRotateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.rotateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.all })
    },
  })
}

/**
 * Hook to revoke API key
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.all })
      toast.success('API key revoked successfully')
    },
  })
}

export default useApiKeys
