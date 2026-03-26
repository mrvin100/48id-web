/**
 * WEB-S4-FE-03 — Admin Traffic Tab
 * Verifies traffic tab renders table, empty state, error state, loading state,
 * and row click navigation — now inlined in DashboardModule.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
}))

vi.mock('@/hooks/use-dashboard-traffic', () => ({
  useDashboardTraffic: vi.fn(),
}))

const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: vi.fn(() => new URLSearchParams('tab=traffic') as any),
  usePathname: () => '/dashboard',
}))

import { useDashboard } from '@/hooks/use-dashboard'
import { useDashboardTraffic } from '@/hooks/use-dashboard-traffic'
import { DashboardModule } from '@/components/modules/dashboard'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

const mockAccount = {
  accountId: 'acc-1',
  accountName: '48Hub Team',
  apiKeyTraffic: { totalCalls: 1240, last24h: 87, lastCalledAt: null },
  memberActivity: { totalActions: 34, last24h: 5, lastActionAt: null },
}

beforeEach(() => {
  mockPush.mockClear()
  vi.mocked(useDashboard).mockReturnValue({
    metrics: undefined,
    loginActivity: [],
    recentActivity: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
  vi.mocked(useDashboardTraffic).mockReturnValue({
    data: { accounts: [mockAccount], generatedAt: new Date().toISOString() },
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useDashboardTraffic>)
})

describe('WEB-S4-FE-03 — Traffic tab (inlined)', () => {
  it('renders table headers', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('Account Name')).toBeInTheDocument()
    expect(screen.getByText('API Key Calls (total)')).toBeInTheDocument()
    expect(screen.getByText('Member Actions (total)')).toBeInTheDocument()
  })

  it('renders account row data', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('48Hub Team')).toBeInTheDocument()
    expect(screen.getByText('1240')).toBeInTheDocument()
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
  })

  it('navigates to account traffic detail on row click', async () => {
    const user = userEvent.setup()
    render(<DashboardModule />, { wrapper })
    await user.click(screen.getByText('48Hub Team'))
    expect(mockPush).toHaveBeenCalledWith('/operator-accounts/acc-1/traffic')
  })

  it('shows empty state when no accounts', () => {
    vi.mocked(useDashboardTraffic).mockReturnValue({
      data: { accounts: [], generatedAt: new Date().toISOString() },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useDashboardTraffic>)
    render(<DashboardModule />, { wrapper })
    expect(
      screen.getByText('No operator accounts with traffic yet.')
    ).toBeInTheDocument()
  })

  it('shows loading skeletons', () => {
    vi.mocked(useDashboardTraffic).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useDashboardTraffic>)
    render(<DashboardModule />, { wrapper })
    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0)
  })

  it('shows error state', () => {
    vi.mocked(useDashboardTraffic).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    } as unknown as ReturnType<typeof useDashboardTraffic>)
    render(<DashboardModule />, { wrapper })
    expect(
      screen.getByText('Failed to load traffic data.')
    ).toBeInTheDocument()
  })
})
