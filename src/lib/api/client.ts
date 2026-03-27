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
    .then(res => {
      // Only treat 200 as a successful refresh.
      // 503 = backend unavailable (keep session, don't redirect).
      // 401 = token truly invalid (caller will handle redirect).
      return res.status === 200
    })
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
        // Only handle 401 on the client side (browser context)
        if (response.status !== 401 || typeof window === 'undefined') {
          return response
        }

        // Avoid refresh loop: if this request IS the refresh call, don't re-attempt
        if (request.url.includes('/api/auth/refresh')) {
          return response
        }

        const refreshed = await attemptRefresh()
        if (refreshed) {
          // Retry the original request once with the new cookie
          return ky(request)
        }

        // Refresh failed — only redirect to login if the user has no persisted
        // session in localStorage. This prevents spurious redirects during the
        // initial page load/compile when operator dashboard API calls fire before
        // the cookie is fully available on the client.
        try {
          const stored = localStorage.getItem('48id-auth-storage')
          const parsed = stored ? JSON.parse(stored) : null
          const isAuthenticated = parsed?.state?.isAuthenticated === true
          if (!isAuthenticated) {
            const currentPath = window.location.pathname
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=session_expired`
          }
          // If user appears authenticated locally, don't redirect — let the
          // component handle the error gracefully (show an error/retry state).
        } catch {
          // localStorage not available — safe to redirect
          const currentPath = window.location.pathname
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=session_expired`
        }

        // 403 = permissions error, not a session error — never redirect to login
        return response
      },
    ],
  },
})

export default apiClient
