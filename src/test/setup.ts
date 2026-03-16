import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { beforeAll, afterEach, afterAll } from '@jest/globals'

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
})

afterEach(() => {
  // Cleanup after each test
  jest.clearAllMocks()
})

afterAll(() => {
  // Global cleanup
})

// Property-based testing configuration for fast-check
export const propertyTestConfig = {
  numRuns: 100, // Run each property test 100 times as specified in design
  verbose: true,
  seed: 42, // Fixed seed for reproducible tests
}
