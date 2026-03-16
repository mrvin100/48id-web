// Central type exports for the 48ID Admin Portal

// Authentication types
export * from './auth.types'

// User management types
export * from './user.types'

// CSV import types
export * from './csv.types'

// API and backend types
export * from './api.types'

// Audit log types
export * from './audit.types'

// Dashboard types
export * from './dashboard.types'

// Additional common types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: string
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  primary?: boolean
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
  lastUpdated?: string
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string
  pagination?: PaginationConfig
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, unknown>) => void
}

export interface PaginationConfig {
  page: number
  size: number
  total: number
  showSizeSelector?: boolean
  showPageInfo?: boolean
}
