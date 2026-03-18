/**
 * HTTP Client Configuration
 *
 * Centralized HTTP client using ky for all API communications.
 * Handles error handling and request/response transformations.
 * Authentication is handled by Next.js middleware via HTTP-only cookies.
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
        // Add common headers
        request.headers.set('Content-Type', 'application/json')
        // Note: Authentication is handled by Next.js middleware via HTTP-only cookies
        // No need to manually set Authorization headers
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle authentication errors
        if (response.status === 401) {
          // Redirect to login page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
          }
        }

        return response
      },
    ],
  },
})

export default apiClient
