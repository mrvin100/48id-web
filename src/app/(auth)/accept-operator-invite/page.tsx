import { Suspense } from 'react'
import { AcceptOperatorInviteModule } from '@/components/modules/auth/accept-operator-invite'

export default function AcceptOperatorInvitePage() {
  return (
    <Suspense>
      <AcceptOperatorInviteModule />
    </Suspense>
  )
}
