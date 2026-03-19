import { useQuery, useMutation } from '@tanstack/react-query'
import { activationApi } from '@/lib/api/activation'
import { authKeys } from '@/lib/query-keys'

export function useActivateAccount(token: string | null) {
  return useQuery({
    queryKey: authKeys.activation(token ?? ''),
    queryFn: () => activationApi.activateAccount(token!),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      activationApi.resetPassword(token, newPassword),
  })
}
