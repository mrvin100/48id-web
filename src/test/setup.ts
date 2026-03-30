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
  const mockResponse = {
    json: vi.fn(() => Promise.resolve({})),
    text: vi.fn(() => Promise.resolve('')),
  }

  const mockKy = vi.fn().mockReturnValue(mockResponse)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(mockKy as any).create = vi.fn(() => mockKy)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(mockKy as any).get = vi.fn(() => mockResponse)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(mockKy as any).post = vi.fn(() => mockResponse)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(mockKy as any).put = vi.fn(() => mockResponse)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(mockKy as any).delete = vi.fn(() => mockResponse)

  return {
    default: mockKy,
    __esModule: true,
    HTTPError: class MockHTTPError extends Error {
      response: { status: number; json: () => Promise<unknown> }
      constructor(response = { status: 500, json: () => Promise.resolve({}) }) {
        super('HTTP Error')
        this.response = response
      }
    },
    TimeoutError: class MockTimeoutError extends Error {
      constructor() {
        super('Request timed out')
        this.name = 'TimeoutError'
      }
    },
  }
})

// Global test setup
beforeAll(() => {
  // ResizeObserver is not implemented in jsdom — required by recharts
  global.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
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
