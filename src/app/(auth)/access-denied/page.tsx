/**
 * Access Denied Page
 *
 * This page renders the access denied module component.
 * Following the modular architecture pattern where pages only render components.
 *
 * Requirements: 1.5, 10.2
 */

import { AccessDeniedModule } from '@/components/modules/auth'

export default function AccessDeniedPage() {
  return <AccessDeniedModule />
}
