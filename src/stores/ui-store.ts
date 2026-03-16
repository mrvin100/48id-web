import { config } from '@/lib/env'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * Notification interface for toast messages
 */
export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * UI store state interface
 */
interface UIState {
  // Layout state
  sidebarOpen: boolean
  sidebarCollapsed: boolean

  // Theme state
  theme: 'light' | 'dark' | 'system'

  // Notification state
  notifications: Notification[]

  // Loading states for global operations
  globalLoading: boolean
  loadingMessage: string

  // Modal state
  activeModal: string | null
  modalData: unknown

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  setTheme: (theme: 'light' | 'dark' | 'system') => void

  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  setGlobalLoading: (loading: boolean, message?: string) => void

  openModal: (modalId: string, data?: unknown) => void
  closeModal: () => void
}

/**
 * UI store implementation using Zustand
 *
 * Features:
 * - Persistent theme and layout preferences
 * - Notification queue management
 * - Global loading state management
 * - Modal state management
 * - Responsive sidebar state
 */
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      immer((set, _get) => ({
        // Initial state
        sidebarOpen: true,
        sidebarCollapsed: false,
        theme: 'system',
        notifications: [],
        globalLoading: false,
        loadingMessage: '',
        activeModal: null,
        modalData: null,

        // Sidebar actions
        toggleSidebar: () =>
          set(state => {
            state.sidebarOpen = !state.sidebarOpen
          }),

        setSidebarOpen: open =>
          set(state => {
            state.sidebarOpen = open
          }),

        toggleSidebarCollapsed: () =>
          set(state => {
            state.sidebarCollapsed = !state.sidebarCollapsed
          }),

        setSidebarCollapsed: collapsed =>
          set(state => {
            state.sidebarCollapsed = collapsed
          }),

        // Theme actions
        setTheme: theme =>
          set(state => {
            state.theme = theme
          }),

        // Notification actions
        addNotification: notification =>
          set(state => {
            const id = Math.random().toString(36).substring(2, 9)
            state.notifications.push({
              ...notification,
              id,
              duration: notification.duration ?? 5000,
            })
          }),

        removeNotification: id =>
          set(state => {
            state.notifications = state.notifications.filter(
              (n: Notification) => n.id !== id
            )
          }),

        clearNotifications: () =>
          set(state => {
            state.notifications = []
          }),

        // Global loading actions
        setGlobalLoading: (loading, message = '') =>
          set(state => {
            state.globalLoading = loading
            state.loadingMessage = message
          }),

        // Modal actions
        openModal: (modalId, data = null) =>
          set(state => {
            state.activeModal = modalId
            state.modalData = data
          }),

        closeModal: () =>
          set(state => {
            state.activeModal = null
            state.modalData = null
          }),
      })),
      {
        name: '48id-ui-storage',
        // Persist user preferences
        partialize: state => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'ui-store',
      enabled: config.app.enableDebug,
    }
  )
)

/**
 * Selectors for common UI state patterns
 */
export const uiSelectors = {
  sidebarOpen: (state: UIState) => state.sidebarOpen,
  sidebarCollapsed: (state: UIState) => state.sidebarCollapsed,
  theme: (state: UIState) => state.theme,
  notifications: (state: UIState) => state.notifications,
  globalLoading: (state: UIState) => state.globalLoading,
  loadingMessage: (state: UIState) => state.loadingMessage,
  activeModal: (state: UIState) => state.activeModal,
  modalData: (state: UIState) => state.modalData,
}

/**
 * Utility functions for common notification patterns
 */
export const notificationHelpers = {
  success: (title: string, message: string) => ({
    title,
    message,
    type: 'success' as const,
  }),

  error: (title: string, message: string) => ({
    title,
    message,
    type: 'error' as const,
    duration: 8000, // Longer duration for errors
  }),

  warning: (title: string, message: string) => ({
    title,
    message,
    type: 'warning' as const,
  }),

  info: (title: string, message: string) => ({
    title,
    message,
    type: 'info' as const,
  }),
}
