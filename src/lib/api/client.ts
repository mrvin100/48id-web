/**
 * HTTP Client Configuration
 *
 * Centralized HTTP client using ky for all API communications.
 * Handles authentication, error handling, and request/response transformations.
 */

import ky from 'ky'
import { config } from '@/lib/env'

// Create the main API client
export const apiClient = ky.create({
  prefixUrl: config.frontend.apiBase, // '/api'
  timeout: config.backend.timeout,
  retry: {
    limit: config.backend.retryLimit,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      request => {
        // Add authentication headers if available
        const token = getAuthToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }

        // Add common headers
        request.headers.set('Content-Type', 'application/json')
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle authentication errors
        if (response.status === 401) {
          // Clear auth and redirect to login
          clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }

        return response
      },
    ],
  },
})

// Auth token management (placeholder - implement based on your auth strategy)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  // Get from localStorage, cookies, or your auth store
  return localStorage.getItem('auth-token')
}

function clearAuth(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('auth-token')
  // Clear other auth-related storage
}

export default apiClient
