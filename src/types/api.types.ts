// API types - will be expanded across all sprints

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface BFFRequest<T = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  data?: T
  params?: Record<string, string>
  headers?: Record<string, string>
}

export interface BFFResponse<T = unknown> {
  data: T
  status: number
  message?: string
  timestamp: string
}

export interface BFFError {
  status: number
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
  path: string
}

export interface APIError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export interface ValidationError {
  field: string
  message: string
  code: string
  rejectedValue?: unknown
}

export interface BackendErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  details?: ValidationError[]
}
