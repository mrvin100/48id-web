import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { OperatorTrafficPage } from '@/components/modules/operator'
import { AdminTrafficModule } from '@/components/modules/dashboard/admin-traffic-module'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function TrafficPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const role = await getServerUserRole()
  const { accountId } = await searchParams

  // Operator-scoped traffic: student in operator mode passes accountId via URL
  if (accountId) {
    return <OperatorTrafficPage accountId={accountId} />
  }

  // Admin sees aggregated traffic across all operator accounts
  if (role === UserRole.ADMIN) {
    return <AdminTrafficModule />
  }

  return <AccessDeniedModule />
}
