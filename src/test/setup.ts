import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
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
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}))

// Mock ky HTTP client to prevent real HTTP requests in tests
vi.mock('ky', () => {
  const mockKy = vi.fn()
  mockKy.create = vi.fn(() => mockKy)
  mockKy.get = vi.fn(() => ({
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
  }))
  mockKy.post = vi.fn(() => ({
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
  }))
  mockKy.put = vi.fn(() => ({
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
  }))
  mockKy.delete = vi.fn(() => ({
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
  }))
  return { default: mockKy, __esModule: true }
})

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
})

afterEach(() => {
  // Cleanup after each test
  vi.clearAllMocks()
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
