import { Suspense } from 'react'
import { DashboardModule } from '@/components/modules/dashboard'

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardModule />
    </Suspense>
  )
}
