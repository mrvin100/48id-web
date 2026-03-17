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

  // Dashboard routes
  DASHBOARD: '/dashboard',

  // User management routes
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,

  // CSV import routes
  CSV_IMPORT: '/csv-import',

  // Audit routes
  AUDIT: '/audit',

  // API keys routes
  API_KEYS: '/api-keys',

  // API routes
  API: {
    AUTH: {
      LOGIN: '/api/auth/login',
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
  },
} as const

/**
 * Navigation items for the sidebar
 */
export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    title: 'Users',
    href: ROUTES.USERS,
    icon: 'Users',
  },
  {
    title: 'CSV Import',
    href: ROUTES.CSV_IMPORT,
    icon: 'Upload',
  },
  {
    title: 'Audit Logs',
    href: ROUTES.AUDIT,
    icon: 'FileText',
  },
  {
    title: 'API Keys',
    href: ROUTES.API_KEYS,
    icon: 'Key',
  },
] as const

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
    [ROUTES.HOME]: '48ID Admin Portal',
    [ROUTES.LOGIN]: 'Login - 48ID Admin Portal',
    [ROUTES.ACCESS_DENIED]: 'Access Denied - 48ID Admin Portal',
    [ROUTES.DASHBOARD]: 'Dashboard - 48ID Admin Portal',
    [ROUTES.USERS]: 'Users - 48ID Admin Portal',
    [ROUTES.CSV_IMPORT]: 'CSV Import - 48ID Admin Portal',
    [ROUTES.AUDIT]: 'Audit Logs - 48ID Admin Portal',
    [ROUTES.API_KEYS]: 'API Keys - 48ID Admin Portal',
  }

  return titles[pathname] || '48ID Admin Portal'
}
