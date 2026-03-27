import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import { StudentOperatorsModule } from '@/components/modules/student'
import { AccessDeniedModule } from '@/components/modules/auth'

export default async function OperatorsPage() {
  const role = await getServerUserRole()

  // Operators view is for STUDENT only
  if (role === UserRole.STUDENT) {
    return <StudentOperatorsModule />
  }

  return <AccessDeniedModule />
}
