import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { UsersModule } from '@/components/modules/users'
import { OperatorUsersPage } from '@/components/modules/operator'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>
}) {
  const role = await getServerUserRole()
  const { accountId } = await searchParams

  // Operator-scoped users: student in operator mode passes accountId via URL
  if (accountId) {
    return <OperatorUsersPage accountId={accountId} />
  }

  // Admin sees the full user management module
  if (role === UserRole.ADMIN) {
    return <UsersModule />
  }

  return <AccessDeniedModule />
}
