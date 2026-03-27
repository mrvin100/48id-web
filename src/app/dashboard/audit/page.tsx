import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { AuditLogModule } from '@/components/modules/audit'
import { OperatorAuditPage } from '@/components/modules/operator'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const role = await getServerUserRole()
  const { accountId } = await searchParams

  // Operator-scoped audit: student in operator mode passes accountId via URL
  if (accountId) {
    return <OperatorAuditPage accountId={accountId} />
  }

  // Admin sees the global audit log
  if (role === UserRole.ADMIN) {
    return <AuditLogModule />
  }

  return <AccessDeniedModule />
}
