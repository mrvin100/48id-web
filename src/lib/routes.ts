/**
 * Centralized Routes Configuration
 *
 * This file contains all static routes used throughout the application.
 * This makes it easy to update routes in the future and maintain consistency.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  ACCESS_DENIED: '/access-denied',

  // Auth routes
  ACTIVATE_ACCOUNT: '/activate-account',
  RESET_PASSWORD: '/reset-password',

  // Dashboard routes (ADMIN)
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  CSV_IMPORT: '/csv-import',
  AUDIT: '/audit',
  API_KEYS: '/api-keys',

  // Operator routes
  OPERATOR: {
    DASHBOARD: '/operator/dashboard',
    USERS: '/operator/users',
    AUDIT: '/operator/audit',
    TRAFFIC: '/operator/traffic',
    API_KEY: '/operator/api-key',
  },

  // API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth/login',
      ACTIVATE: '/api/auth/activate',
      RESET_PASSWORD: '/api/auth/reset-password',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
    USERS: {
      LIST: '/api/users',
      DETAIL: (id: string) => `/api/users/${id}`,
    },
    DASHBOARD: {
      METRICS: '/api/dashboard/metrics',
    },
    CSV: {
      IMPORT: '/api/csv/import',
      TEMPLATE: '/api/csv/template',
      VALIDATE: '/api/csv/validate',
    },
    AUDIT: {
      LOGS: '/api/audit/logs',
    },
    API_KEYS: {
      LIST: '/api/api-keys',
    },
    OPERATOR: {
      USERS: '/api/operator/users',
      AUDIT_LOG: '/api/operator/audit-log',
      TRAFFIC: '/api/operator/traffic',
      API_KEYS: '/api/operator/api-keys',
    },
  },
} as const

/**
 * @deprecated Use getNavigationForRole() from '@/lib/navigation' instead.
 */
export const NAVIGATION_ITEMS = [] as const

/**
 * Helper function to check if a route is active
 */
export const isRouteActive = (
  currentPath: string,
  targetPath: string
): boolean => {
  if (targetPath === ROUTES.DASHBOARD) {
    return currentPath === targetPath
  }
  return currentPath.startsWith(targetPath)
}

/**
 * Get the page title based on the current route
 */
export const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    [ROUTES.HOME]: '48ID Portal',
    [ROUTES.LOGIN]: 'Login - 48ID Portal',
    [ROUTES.ACCESS_DENIED]: 'Access Denied - 48ID Portal',
    [ROUTES.DASHBOARD]: 'Dashboard - 48ID Admin Portal',
    [ROUTES.USERS]: 'Users - 48ID Admin Portal',
    [ROUTES.CSV_IMPORT]: 'CSV Import - 48ID Admin Portal',
    [ROUTES.AUDIT]: 'Audit Logs - 48ID Admin Portal',
    [ROUTES.API_KEYS]: 'API Keys - 48ID Admin Portal',
    [ROUTES.OPERATOR.DASHBOARD]: 'Dashboard - 48ID Operator Portal',
    [ROUTES.OPERATOR.USERS]: 'Users - 48ID Operator Portal',
    [ROUTES.OPERATOR.AUDIT]: 'Audit Logs - 48ID Operator Portal',
    [ROUTES.OPERATOR.TRAFFIC]: 'Traffic - 48ID Operator Portal',
    [ROUTES.OPERATOR.API_KEY]: 'API Key - 48ID Operator Portal',
  }

  return titles[pathname] || '48ID Portal'
}
