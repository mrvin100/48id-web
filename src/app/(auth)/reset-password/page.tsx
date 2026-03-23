import { Suspense } from 'react'
import { ResetPasswordModule } from '@/components/modules/auth'

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordModule />
    </Suspense>
  )
}
