/**
 * HTTP Client Configuration
 *
 * Centralized HTTP client using ky for all API communications.
 * Authentication is handled by Next.js middleware via HTTP-only cookies.
 * Silent token refresh with deduplication via shared refreshPromise.
 */

import ky from 'ky'
import { config } from '@/lib/env'

// Shared refresh promise — prevents concurrent 401s from triggering multiple refreshes
let refreshPromise: Promise<boolean> | null = null

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
    .then(res => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

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
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401 && typeof window !== 'undefined') {
          const refreshed = await attemptRefresh()
          if (refreshed) {
            // Retry the original request once after successful refresh
            return ky(request)
          }
          // Refresh failed — redirect to login
          const currentPath = window.location.pathname
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=session_expired`
        }
        return response
      },
    ],
  },
})

export default apiClient
