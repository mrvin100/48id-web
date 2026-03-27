'use client'

/**
 * Student Dashboard Wrapper Component
 *
 * Handles dynamic switching between the student view and operator view.
 * When a student selects an operator account, this renders the OperatorDashboardModule.
 * Otherwise it renders the StudentDashboardModule.
 *
 * Uses the `useOperatorHydrated()` selector from the operator store — the Zustand
 * best practice for handling sessionStorage rehydration. This avoids the anti-pattern
 * of `useEffect(() => setMounted(true), [])` which causes unnecessary re-renders and
 * doesn't integrate with the store's own lifecycle.
 */

import {
  useOperatorContext,
  useOperatorHydrated,
} from '@/stores/operator-store'
import {
  StudentDashboardModule,
  OperatorDashboardModule,
} from '@/components/modules/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export function StudentDashboardWrapper() {
  const hydrated = useOperatorHydrated()
  const { selectedOperator, isOperatorMode } = useOperatorContext()

  // Wait for sessionStorage rehydration before reading persisted state.
  // This is driven by the store's onRehydrateStorage callback — not a manual timer.
  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  // Operator mode: show operator dashboard for the selected account.
  // Students always land on their student view first (isOperatorMode starts false).
  // They consciously switch via the Operators page → "Enter" button, which sets
  // isOperatorMode = true and navigates here. Exiting via "Back to Student View"
  // calls clearOperator() → isOperatorMode = false → this shows StudentDashboardModule.
  if (isOperatorMode && selectedOperator) {
    return <OperatorDashboardModule accountId={selectedOperator.id} />
  }

  // Default: student view
  return <StudentDashboardModule />
}
