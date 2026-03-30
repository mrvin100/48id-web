import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { SettingsModule } from '@/components/modules/settings'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function ProfilePage() {
  const role = await getServerUserRole()

  // Profile is primarily for STUDENTS
  if (role === UserRole.STUDENT) {
    return <SettingsModule />
  }

  // Admin and Operator see access denied (they should use settings if needed)
  return <AccessDeniedModule />
}
