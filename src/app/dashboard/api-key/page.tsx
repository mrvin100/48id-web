import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { OperatorApiKeyPage } from '@/components/modules/operator'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function ApiKeyPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; isOwner?: string }>
}) {
  const role = await getServerUserRole()
  const { accountId, isOwner } = await searchParams

  // Operator-scoped API key: student in operator mode passes accountId via URL
  if (accountId) {
    return (
      <OperatorApiKeyPage accountId={accountId} isOwner={isOwner === 'true'} />
    )
  }

  // API Key page is only for operator context — admins use /dashboard/api-keys
  void role
  return <AccessDeniedModule />
}
