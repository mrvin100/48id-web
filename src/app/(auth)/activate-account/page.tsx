import { Suspense } from 'react'
import { ActivateAccountModule } from '@/components/modules/auth'

export default function ActivateAccountPage() {
  return (
    <Suspense>
      <ActivateAccountModule />
    </Suspense>
  )
}
