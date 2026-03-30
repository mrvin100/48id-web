import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { ApiKeysModule } from '@/components/modules/api-keys'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function ApiKeysPage() {
  const role = await getServerUserRole()

  // API Keys management is for ADMIN only
  if (role === UserRole.ADMIN) {
    return <ApiKeysModule />
  }

  return <AccessDeniedModule />
}
