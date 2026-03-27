import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { ProvisioningModule } from '@/components/modules/csv-import'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function CsvImportPage() {
  const role = await getServerUserRole()

  // CSV Import is for ADMIN only
  if (role === UserRole.ADMIN) {
    return <ProvisioningModule />
  }

  return <AccessDeniedModule />
}
