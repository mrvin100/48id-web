import { getServerUserRole } from '@/lib/server-role'
import { UserRole } from '@/types/auth.types'
import {
  DashboardModule,
  StudentDashboardWrapper,
} from '@/components/modules/dashboard'

export default async function DashboardPage() {
  const role = await getServerUserRole()

  // Admins see the full admin analytics dashboard
  if (role === UserRole.ADMIN) {
    return <DashboardModule />
  }

  // Students (and operators who are students) use the wrapper which handles
  // operator mode switching client-side via Zustand operator context store.
  // Note: There is no standalone OPERATOR login — operators are managed by students.
  return <StudentDashboardWrapper />
}
