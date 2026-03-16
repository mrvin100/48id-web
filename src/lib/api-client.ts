import ky, { type KyInstance, type Options } from 'ky'

/**
 * Base API client configuration using ky
 *
 * ky is a lightweight, modern HTTP client that provides:
 * - Built-in JSON handling
 * - Automatic request/response transformation
 * - Better error handling than fetch
 * - TypeScript support out of the box
 * - Smaller bundle size compared to axios
 */

// Base configuration for all API requests
const baseOptions: Options = {
  // All API requests go through the BFF layer
  prefixUrl: '/api',

  // Default timeout of 30 seconds
  timeout: 30000,

  // Automatically parse JSON responses
  parseJson: text => JSON.parse(text),

  // Include credentials (cookies) in all requests
  credentials: 'include',

  // Default headers
  headers: {
    'Content-Type': 'application/json',
  },

  // Retry configuration
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000,
  },

  // Custom hooks for request/response handling
  hooks: {
    beforeRequest: [
      request => {
        // Add CSRF token if available
        const csrfToken = document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute('content')
        if (csrfToken) {
          request.headers.set('X-CSRF-Token', csrfToken)
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 ${request.method} ${request.url}`)
        }
      },
    ],

    beforeError: [
      error => {
        // Enhanced error logging
        if (process.env.NODE_ENV === 'development') {
          console.error(
            `❌ ${error.request.method} ${error.request.url}:`,
            error.response?.status,
            error.message
          )
        }

        return error
      },
    ],

    afterResponse: [
      (request, options, response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${request.method} ${request.url}:`, response.status)
        }

        return response
      },
    ],
  },
}

// Create the main API client instance
export const apiClient: KyInstance = ky.create(baseOptions)

/**
 * Specialized API clients for different domains
 * These provide domain-specific configurations and can be extended as needed
 */

// Authentication API client
export const authApi = apiClient.extend({
  prefixUrl: '/api/auth',
  timeout: 10000, // Shorter timeout for auth requests
})

// User management API client
export const userApi = apiClient.extend({
  prefixUrl: '/api/users',
})

// Dashboard API client
export const dashboardApi = apiClient.extend({
  prefixUrl: '/api/dashboard',
  timeout: 15000, // Longer timeout for dashboard metrics
})

// CSV import API client
export const csvApi = apiClient.extend({
  prefixUrl: '/api/csv',
  timeout: 120000, // Much longer timeout for file uploads
})

// Audit API client
export const auditApi = apiClient.extend({
  prefixUrl: '/api/audit',
  timeout: 60000, // Longer timeout for large audit queries
})

// API key management client
export const apiKeyApi = apiClient.extend({
  prefixUrl: '/api/api-keys',
})

/**
 * Error types for better error handling
 */
export interface ApiError {
  status: number
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Utility function to handle API errors consistently
 */
export const handleApiError = (error: unknown): ApiError => {
  // Type guard to check if error has response property
  if (error && typeof error === 'object' && 'response' in error) {
    const errorWithResponse = error as {
      response: { status: number; body?: unknown }
      message?: string
    }
    return {
      status: errorWithResponse.response.status,
      code: errorWithResponse.response.status.toString(),
      message: errorWithResponse.message || 'An error occurred',
      details: errorWithResponse.response.body as
        | Record<string, unknown>
        | undefined,
    }
  }

  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: 'Network error occurred',
  }
}

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T
  status: number
  message?: string
}

/**
 * Paginated response type for list endpoints
 */
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

/**
 * Common request parameters for list endpoints
 */
export interface ListParams {
  page?: number
  size?: number
  sort?: string
  search?: string
  [key: string]: unknown
}
