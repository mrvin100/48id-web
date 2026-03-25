/**
 * WEB-S4-FE-03 — Admin Traffic Tab
 * Verifies TrafficTab renders table, empty state, error state, loading state,
 * and row click navigation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/hooks/use-dashboard-traffic', () => ({
  useDashboardTraffic: vi.fn(),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => '/dashboard',
}))

import { useDashboardTraffic } from '@/hooks/use-dashboard-traffic'
import { TrafficTab } from '@/components/modules/dashboard'

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
  vi.mocked(useDashboardTraffic).mockReturnValue({
    data: { accounts: [mockAccount], generatedAt: new Date().toISOString() },
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useDashboardTraffic>)
})

describe('WEB-S4-FE-03 — TrafficTab', () => {
  it('renders table headers', () => {
    render(<TrafficTab />, { wrapper })
    expect(screen.getByText('Account Name')).toBeInTheDocument()
    expect(screen.getByText('API Key Calls (total)')).toBeInTheDocument()
    expect(screen.getByText('Member Actions (total)')).toBeInTheDocument()
  })

  it('renders account row data', () => {
    render(<TrafficTab />, { wrapper })
    expect(screen.getByText('48Hub Team')).toBeInTheDocument()
    expect(screen.getByText('1240')).toBeInTheDocument()
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
  })

  it('navigates to account traffic detail on row click', async () => {
    const user = userEvent.setup()
    render(<TrafficTab />, { wrapper })
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
    render(<TrafficTab />, { wrapper })
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
    render(<TrafficTab />, { wrapper })
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
    render(<TrafficTab />, { wrapper })
    expect(
      screen.getByText('Failed to load traffic data.')
    ).toBeInTheDocument()
  })
})
