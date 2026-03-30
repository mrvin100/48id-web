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
  OPERATOR_INVITE: '/operator-invite',
  ACCEPT_OPERATOR_INVITE: '/accept-operator-invite', // Matches backend email URL default

  // Dashboard routes (ADMIN & OPERATOR)
  DASHBOARD: '/dashboard',
  USERS: '/dashboard/users',
  USER_DETAIL: (id: string) => `/dashboard/users/${id}`,
  CSV_IMPORT: '/dashboard/csv-import',
  AUDIT: '/dashboard/audit',
  API_KEYS: '/dashboard/api-keys',
  API_KEY: '/dashboard/api-key',
  TRAFFIC: '/dashboard/traffic',
  SETTINGS: '/dashboard/settings',

  STUDENT: {
    DASHBOARD: '/dashboard',
    PROFILE: '/dashboard/profile',
    OPERATORS: '/dashboard/operators',
    OPERATOR_VIEW: '/dashboard/operators/view',
  },

  // Operator routes - Deprecated: Use unified /dashboard/* namespace instead
  OPERATOR: {
    DASHBOARD: '/dashboard',
    USERS: '/dashboard/users',
    AUDIT: '/dashboard/audit',
    TRAFFIC: '/dashboard/traffic',
    API_KEY: '/dashboard/api-key',
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
      DASHBOARD: '/api/operator/dashboard',
      ACCOUNTS: '/api/operator/accounts',
      ACCOUNT: (id: string) => `/api/operator/accounts/${id}`,
      ACCOUNT_INVITE: (id: string) => `/api/operator/accounts/${id}/invite`,
      ACCOUNT_MEMBER: (id: string, memberId: string) =>
        `/api/operator/accounts/${id}/members/${memberId}`,
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
    [ROUTES.DASHBOARD]: 'Dashboard - 48ID Portal',
    [ROUTES.USERS]: 'Users - 48ID Portal',
    [ROUTES.CSV_IMPORT]: 'CSV Import - 48ID Admin Portal',
    [ROUTES.AUDIT]: 'Audit Logs - 48ID Portal',
    [ROUTES.API_KEYS]: 'API Keys - 48ID Admin Portal',
    [ROUTES.API_KEY]: 'API Key - 48ID Operator Portal',
    [ROUTES.TRAFFIC]: 'Traffic - 48ID Operator Portal',
    [ROUTES.STUDENT.PROFILE]: 'Profile - 48ID Student Portal',
    [ROUTES.STUDENT.OPERATORS]: 'Operators - 48ID Student Portal',
  }

  return titles[pathname] || '48ID Portal'
}
