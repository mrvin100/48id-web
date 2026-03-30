/**
 * WEB-S4-FE-02 — Admin Dashboard metrics rendering
 * Verifies that the admin DashboardModule renders all metric cards
 * and traffic summary data from their respective hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      children,
  }
})

vi.mock('@/hooks/use-dashboard', () => ({
  useDashboard: vi.fn(),
  useAdminTraffic: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => '/dashboard',
}))

import { useDashboard, useAdminTraffic } from '@/hooks/use-dashboard'
import { DashboardModule } from '@/components/modules/dashboard'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockMetrics = {
  totalUsers: 100,
  activeUsers: 80,
  activeSessions: 12,
  pendingActivations: 5,
  suspendedUsers: 3,
}

const mockTraffic = {
  accounts: [
    {
      accountId: 'acc-1',
      accountName: '48Hub Platform',
      apiKeyTraffic: {
        totalCalls: 500,
        last24h: 42,
        lastCalledAt: '2026-03-30T12:00:00Z',
      },
      memberActivity: {
        totalActions: 100,
        last24h: 8,
        lastActionAt: '2026-03-30T11:00:00Z',
      },
    },
  ],
  generatedAt: '2026-03-30T14:00:00Z',
}

beforeEach(() => {
  vi.mocked(useDashboard).mockReturnValue({
    metrics: mockMetrics,
    loginActivity: [],
    recentActivity: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  vi.mocked(useAdminTraffic).mockReturnValue({
    data: mockTraffic,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useAdminTraffic>)
})

describe('WEB-S4-FE-02 — Admin Dashboard metrics', () => {
  it('renders core metric cards', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    expect(screen.getByText('Pending Activations')).toBeInTheDocument()
  })

  it('displays correct total users count', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders traffic summary cards from useAdminTraffic', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('API Calls (24h)')).toBeInTheDocument()
    expect(screen.getByText('Operator Accounts')).toBeInTheDocument()
  })

  it('shows loading state when data is not ready', () => {
    vi.mocked(useDashboard).mockReturnValue({
      metrics: undefined,
      loginActivity: [],
      recentActivity: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<DashboardModule />, { wrapper })
    // Cards still render with loading placeholders
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('shows error alert when data fetch fails', () => {
    vi.mocked(useDashboard).mockReturnValue({
      metrics: undefined,
      loginActivity: [],
      recentActivity: [],
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: vi.fn(),
    })
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('Backend Connection Error')).toBeInTheDocument()
  })
})
