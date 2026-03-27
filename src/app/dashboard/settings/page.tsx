import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { SettingsModule } from '@/components/modules/settings'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function SettingsPage() {
  const role = await getServerUserRole()

  // Settings is for ADMIN only
  if (role === UserRole.ADMIN) {
    return <SettingsModule />
  }

  return <AccessDeniedModule />
}
