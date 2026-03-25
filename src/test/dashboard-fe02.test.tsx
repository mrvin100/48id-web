/**
 * WEB-S4-FE-02 — Dashboard tab layout
 * Verifies tab rendering and URL-driven tab state.
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

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => '/dashboard',
}))

import { useSearchParams } from 'next/navigation'
import { useDashboard } from '@/hooks/use-dashboard'
import { DashboardModule } from '@/components/modules/dashboard'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams())
  vi.mocked(useDashboard).mockReturnValue({
    metrics: {
      totalUsers: 10,
      activeUsers: 8,
      activeSessions: 2,
      pendingActivations: 1,
      suspendedUsers: 0,
      systemHealth: 'operational',
    },
    loginActivity: [],
    recentActivity: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
})

describe('WEB-S4-FE-02 — Dashboard tab layout', () => {
  it('renders both tab triggers', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Traffic' })).toBeInTheDocument()
  })

  it('defaults to overview tab when no ?tab param', () => {
    render(<DashboardModule />, { wrapper })
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('shows traffic tab content when ?tab=traffic', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('tab=traffic')
    )
    render(<DashboardModule />, { wrapper })
    expect(
      screen.getByText(/Traffic data will be available/i)
    ).toBeInTheDocument()
  })

  it('calls router.replace with ?tab=traffic on tab click', async () => {
    const user = userEvent.setup()
    render(<DashboardModule />, { wrapper })
    await user.click(screen.getByRole('tab', { name: 'Traffic' }))
    expect(mockReplace).toHaveBeenCalledWith('?tab=traffic')
  })

  it('calls router.replace with ?tab=overview on overview tab click', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('tab=traffic')
    )
    const user = userEvent.setup()
    render(<DashboardModule />, { wrapper })
    await user.click(screen.getByRole('tab', { name: 'Overview' }))
    expect(mockReplace).toHaveBeenCalledWith('?tab=overview')
  })
})
