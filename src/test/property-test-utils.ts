import * as fc from 'fast-check'

// Property test configuration
export const propertyTestConfig = {
  numRuns: 10, // Reduced for faster development testing (use 100 in CI)
  verbose: false, // Reduced verbosity for faster runs
  seed: 42, // Fixed seed for reproducible tests
}

// Common arbitraries for the 48ID-web admin portal

// User-related arbitraries
export const userIdArbitrary = fc.uuid()

export const matriculeArbitrary = fc
  .tuple(
    fc.constantFrom('STU', 'ADM', 'TCH'),
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1000, max: 9999 })
  )
  .map(([prefix, year, num]) => `${prefix}${year}${num}`)

export const emailArbitrary = fc.emailAddress()

export const nameArbitrary = fc
  .string({
    minLength: 2,
    maxLength: 50,
  })
  .map(s => s.trim() || 'John Doe')

export const phoneArbitrary = fc.option(
  fc
    .tuple(
      fc.constantFrom('+1', '+33', '+212', ''),
      fc.integer({ min: 100000000, max: 999999999 })
    )
    .map(([prefix, num]) => `${prefix}${num}`)
)

export const batchArbitrary = fc.integer({ min: 2020, max: 2030 }).map(String)

export const specializationArbitrary = fc.constantFrom(
  'Software Engineering',
  'Data Science',
  'Cybersecurity',
  'Computer Networks',
  'Artificial Intelligence'
)

export const userStatusArbitrary = fc.constantFrom(
  'ACTIVE',
  'PENDING_ACTIVATION',
  'SUSPENDED'
)

export const userRoleArbitrary = fc.constantFrom('STUDENT', 'ADMIN')

export const userRolesArbitrary = fc.array(userRoleArbitrary, { minLength: 1 })

// Complete User object arbitrary
export const userArbitrary = fc.record({
  id: userIdArbitrary,
  matricule: matriculeArbitrary,
  email: emailArbitrary,
  name: nameArbitrary,
  phone: phoneArbitrary,
  batch: batchArbitrary,
  specialization: specializationArbitrary,
  status: userStatusArbitrary,
  roles: userRolesArbitrary,
  profileCompleted: fc.boolean(),
  lastLoginAt: fc.option(fc.date().map(d => d.toISOString())),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
})

// Authentication-related arbitraries
export const adminCredentialsArbitrary = fc.record({
  matricule: matriculeArbitrary,
  password: fc.string({ minLength: 8, maxLength: 128 }),
})

export const validAdminUserArbitrary = userArbitrary.filter(user =>
  user.roles.includes('ADMIN')
)

// CSV-related arbitraries
export const csvRowArbitrary = fc.record({
  matricule: matriculeArbitrary,
  email: emailArbitrary,
  name: nameArbitrary,
  phone: phoneArbitrary.map(p => p || ''),
  batch: batchArbitrary,
  specialization: specializationArbitrary,
})

export const csvDataArbitrary = fc.array(csvRowArbitrary, {
  minLength: 1,
  maxLength: 100,
})

// API Key arbitraries
export const apiKeyArbitrary = fc.record({
  id: userIdArbitrary,
  applicationName: fc.string({ minLength: 3, maxLength: 50 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  createdAt: fc.date().map(d => d.toISOString()),
  lastUsedAt: fc.option(fc.date().map(d => d.toISOString())),
  createdBy: userIdArbitrary,
})

// Audit log arbitraries
export const auditLogArbitrary = fc.record({
  id: userIdArbitrary,
  userId: userIdArbitrary,
  action: fc.constantFrom(
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_STATUS_CHANGED',
    'PASSWORD_RESET',
    'API_KEY_CREATED',
    'API_KEY_REVOKED'
  ),
  ipAddress: fc.ipV4(),
  userAgent: fc.string({ minLength: 20, maxLength: 200 }),
  timestamp: fc.date().map(d => d.toISOString()),
})

// Pagination arbitraries
export const paginationParamsArbitrary = fc.record({
  page: fc.integer({ min: 0, max: 100 }),
  size: fc.integer({ min: 1, max: 100 }),
  sort: fc.option(fc.string()),
  direction: fc.constantFrom('asc', 'desc'),
})

// Dashboard metrics arbitraries
export const dashboardMetricsArbitrary = fc.record({
  totalUsers: fc.integer({ min: 0, max: 10000 }),
  activeUsers: fc.integer({ min: 0, max: 10000 }),
  pendingActivations: fc.integer({ min: 0, max: 1000 }),
  recentLogins: fc.integer({ min: 0, max: 1000 }),
  systemHealth: fc.constantFrom('UP', 'DOWN', 'DEGRADED'),
})

// Helper function to run property tests with consistent configuration
export function runPropertyTest<T>(
  name: string,
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => boolean
) {
  return fc.assert(fc.property(arbitrary, predicate), propertyTestConfig)
}

// Helper function for async property tests
export function runAsyncPropertyTest<T>(
  name: string,
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => Promise<boolean>
) {
  return fc.assert(fc.asyncProperty(arbitrary, predicate), propertyTestConfig)
}
