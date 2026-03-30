/**
 * Operator Context Store using Zustand
 *
 * This store manages the operator context for students who own or collaborate
 * with operator accounts. It allows switching between student view and operator view.
 *
 * Features:
 * - Track selected operator account
 * - Store member role (OWN, COLLABORATOR)
 * - Toggle between student and operator modes
 * - Persist operator selection across page navigation
 *
 * Storage Strategy:
 * - Operator context persisted in sessionStorage
 * - Cleared when user logs out or switches back to student mode
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useEffect, useState } from 'react'

/**
 * Operator member role types
 */
export type MemberRole = 'OWN' | 'COLLABORATOR'

/**
 * Operator account information
 */
export interface OperatorAccount {
  id: string
  name: string
  role: MemberRole
}

/**
 * Operator context state
 */
interface OperatorContextState {
  // State
  selectedOperator: OperatorAccount | null
  isOperatorMode: boolean

  // Actions
  selectOperator: (operator: OperatorAccount) => void
  clearOperator: () => void
  setOperatorMode: (enabled: boolean) => void

  // Computed getters
  getOperatorId: () => string | null
  getOperatorRole: () => MemberRole | null
  isOwner: () => boolean
}

/**
 * Operator context store implementation.
 *
 * Persistence strategy: sessionStorage
 * - Survives page refreshes and in-app navigation (good UX)
 * - Cleared automatically when the browser tab is closed (no stale state)
 * - Scoped to the tab — multiple tabs are independent (good for multi-account users)
 * - No localStorage bloat or cross-session leakage
 *
 * Hydration:
 * - `_hasHydrated` is false on initial render (SSR safe), set to true after
 *   sessionStorage rehydration via `onFinishHydration`.
 * - Use `useOperatorHydrated()` in components instead of a manual useEffect mounted guard.
 */
export const useOperatorContext = create<OperatorContextState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        selectedOperator: null,
        isOperatorMode: false,

        // Actions
        selectOperator: (operator: OperatorAccount) =>
          set(state => {
            state.selectedOperator = operator
            state.isOperatorMode = true
          }),

        clearOperator: () =>
          set(state => {
            state.selectedOperator = null
            state.isOperatorMode = false
          }),

        setOperatorMode: (enabled: boolean) =>
          set(state => {
            state.isOperatorMode = enabled
            if (!enabled) {
              state.selectedOperator = null
            }
          }),

        // Computed getters
        getOperatorId: () => get().selectedOperator?.id ?? null,
        getOperatorRole: () => get().selectedOperator?.role ?? null,
        isOwner: () => get().selectedOperator?.role === 'OWN',
      })),
      {
        name: '48id-operator-context',
        // sessionStorage: cleared on tab close, persists across page refreshes
        storage: createJSONStorage(() => sessionStorage),
        // Only persist the operator selection — functions are not serializable
        partialize: (state: OperatorContextState) => ({
          selectedOperator: state.selectedOperator,
          isOperatorMode: state.isOperatorMode,
        }),
      }
    ),
    { name: '48id-operator-context' }
  )
)

/**
 * Hook: true once the Zustand persist middleware has finished rehydrating from sessionStorage.
 *
 * Uses `useOperatorContext.persist.onFinishHydration` — the correct Zustand v5 API.
 * Falls back to a simple `useEffect` mount guard so it works in all environments.
 *
 * @example
 * const hydrated = useOperatorHydrated()
 * if (!hydrated) return <Skeleton />
 */
export function useOperatorHydrated(): boolean {
  // Start as false — sessionStorage hasn't been read yet on the server or initial render
  const [hydrated, setHydrated] = useState(() =>
    useOperatorContext.persist.hasHydrated()
  )

  useEffect(() => {
    if (hydrated) return
    const unsub = useOperatorContext.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return unsub
  }, [hydrated])

  return hydrated
}

/**
 * Selectors for operator context state
 */
export const operatorContextSelectors = {
  selectedOperator: (state: OperatorContextState) => state.selectedOperator,
  isOperatorMode: (state: OperatorContextState) => state.isOperatorMode,
  operatorId: (state: OperatorContextState) => state.getOperatorId(),
  operatorRole: (state: OperatorContextState) => state.getOperatorRole(),
  isOwner: (state: OperatorContextState) => state.isOwner(),
}
