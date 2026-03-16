/**
 * Environment Configuration
 *
 * Centralized configuration for all environment variables used throughout the application.
 * This serves as the single entry point for all environment-based configuration.
 */

// Backend API Configuration
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'
export const API_VERSION = process.env.API_VERSION || 'v1'
export const API_BASE_PATH = `/api/${API_VERSION}`

// Full backend API URL
export const BACKEND_API_URL = `${BACKEND_URL}${API_BASE_PATH}`

// Authentication Configuration
export const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'auth-token'
export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || 'refresh-token'
export const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Session Configuration
export const SESSION_TIMEOUT = parseInt(
  process.env.SESSION_TIMEOUT || '1800000'
) // 30 minutes in ms
export const SESSION_WARNING_TIME = parseInt(
  process.env.SESSION_WARNING_TIME || '300000'
) // 5 minutes in ms

// Application Configuration
export const APP_NAME = process.env.APP_NAME || '48ID Admin Portal'
export const APP_VERSION = process.env.APP_VERSION || '1.0.0'
export const NODE_ENV = process.env.NODE_ENV || 'development'

// Security Configuration
export const CSRF_SECRET =
  process.env.CSRF_SECRET || 'csrf-secret-change-in-production'
export const SECURE_COOKIES = process.env.NODE_ENV === 'production'

// API Timeouts (in milliseconds)
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000') // 10 seconds
export const API_RETRY_LIMIT = parseInt(process.env.API_RETRY_LIMIT || '2')

// Frontend API Routes (BFF)
export const FRONTEND_API_BASE = '/api'

// Logging Configuration
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
export const ENABLE_DEBUG = process.env.NODE_ENV === 'development'

// Feature Flags
export const ENABLE_PROPERTY_TESTS =
  process.env.ENABLE_PROPERTY_TESTS !== 'false'
export const ENABLE_ANALYTICS = process.env.ENABLE_ANALYTICS === 'true'

// Contact Information
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@48id.com'
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@48id.com'

// Validation
if (!BACKEND_URL) {
  console.warn(
    'BACKEND_URL environment variable is not set, using default localhost'
  )
}

if (
  NODE_ENV === 'production' &&
  JWT_SECRET === 'your-secret-key-change-in-production'
) {
  throw new Error('JWT_SECRET must be set in production environment')
}

if (
  NODE_ENV === 'production' &&
  CSRF_SECRET === 'csrf-secret-change-in-production'
) {
  throw new Error('CSRF_SECRET must be set in production environment')
}

// Export configuration object for easy importing
export const config = {
  backend: {
    url: BACKEND_URL,
    apiUrl: BACKEND_API_URL,
    apiVersion: API_VERSION,
    apiBasePath: API_BASE_PATH,
    timeout: API_TIMEOUT,
    retryLimit: API_RETRY_LIMIT,
  },
  auth: {
    jwtCookieName: JWT_COOKIE_NAME,
    refreshCookieName: REFRESH_COOKIE_NAME,
    jwtSecret: JWT_SECRET,
    sessionTimeout: SESSION_TIMEOUT,
    sessionWarningTime: SESSION_WARNING_TIME,
  },
  app: {
    name: APP_NAME,
    version: APP_VERSION,
    nodeEnv: NODE_ENV,
    enableDebug: ENABLE_DEBUG,
  },
  security: {
    csrfSecret: CSRF_SECRET,
    secureCookies: SECURE_COOKIES,
  },
  features: {
    enablePropertyTests: ENABLE_PROPERTY_TESTS,
    enableAnalytics: ENABLE_ANALYTICS,
  },
  contact: {
    adminEmail: ADMIN_EMAIL,
    supportEmail: SUPPORT_EMAIL,
  },
  frontend: {
    apiBase: FRONTEND_API_BASE,
  },
  logging: {
    level: LOG_LEVEL,
  },
} as const

export default config
