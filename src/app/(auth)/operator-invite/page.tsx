import { Suspense } from 'react'
import { AcceptOperatorInviteModule } from '@/components/modules/auth/accept-operator-invite'

export default function OperatorInvitePage() {
  return (
    <Suspense>
      <AcceptOperatorInviteModule />
    </Suspense>
  )
}
