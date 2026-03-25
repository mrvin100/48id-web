/**
 * WEB-S4-FE-01 — Remove SystemHealthBadge
 * Verifies that "System Health" card and "System Status" alert are absent
 * from the dashboard, while metric cards and activity chart remain.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock recharts to avoid ResizeObserver / SVG rendering issues in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      children,
  }
})

// Mock the dashboard hook
vi.mock('@/hooks/use-dashboard', () => ({
  useDashboard: vi.fn(),
}))

import { useDashboard } from '@/hooks/use-dashboard'
import { DashboardModule } from '@/components/modules/dashboard'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockMetrics = {
  totalUsers: 100,
  activeUsers: 80,
  activeSessions: 10,
  pendingActivations: 5,
  suspendedUsers: 2,
  systemHealth: 'operational' as const,
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
})

describe('WEB-S4-FE-01 — Dashboard cleanup', () => {
  it('does NOT render System Health card', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.queryByText('System Health')).toBeNull()
  })

  it('does NOT render System Status alert', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.queryByText('System Status')).toBeNull()
  })

  it('still renders metric cards', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('Total Users')).toBeDefined()
    expect(screen.getByText('Active Users')).toBeDefined()
    expect(screen.getByText('Active Sessions')).toBeDefined()
    expect(screen.getByText('Pending Activations')).toBeDefined()
  })

  it('still renders activity chart section', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('7-Day Login Activity')).toBeDefined()
  })

  it('shows backend error alert when isError is true', () => {
    vi.mocked(useDashboard).mockReturnValue({
      metrics: undefined,
      loginActivity: [],
      recentActivity: [],
      isLoading: false,
      isError: true,
      error: new Error('Connection refused'),
      refetch: vi.fn(),
    })
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('Backend Connection Error')).toBeDefined()
    expect(screen.queryByText('System Status')).toBeNull()
  })
})
