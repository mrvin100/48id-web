/**
 * Unit tests for E-FE-03 — Operator Module UI
 * WEB-S4-FE-06, FE-07, FE-08, FE-09
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-operator', () => ({
  useOperatorUsers: vi.fn(),
  useOperatorMembers: vi.fn(),
  useInviteOperatorMember: vi.fn(),
  useRemoveOperatorMember: vi.fn(),
  useOperatorAuditLog: vi.fn(),
  useOperatorTraffic: vi.fn(),
  useOperatorApiKey: vi.fn(),
  useCreateApiKey: vi.fn(),
  useRotateApiKey: vi.fn(),
  useDeleteApiKey: vi.fn(),
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { firstName: 'Test', lastName: 'Operator', roles: ['OPERATOR'] },
    logout: vi.fn(),
  })),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import * as operatorHooks from '@/hooks/use-operator'
import { OperatorUsersModule } from '@/components/modules/operator/operator-users'
import { TrafficTable } from '@/components/modules/operator/traffic-table'
import { ApiKeyPanel } from '@/components/modules/operator/api-key-panel'
import { OperatorDashboardModule } from '@/components/modules/operator/operator-dashboard'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

// ── OperatorUsersModule ────────────────────────────────────────────────────

describe('OperatorUsersModule', () => {
  beforeEach(() => {
    // Members tab (default) needs these hooks
    vi.mocked(operatorHooks.useOperatorMembers).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorMembers>)
    vi.mocked(operatorHooks.useInviteOperatorMember).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof operatorHooks.useInviteOperatorMember>)
    vi.mocked(operatorHooks.useRemoveOperatorMember).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof operatorHooks.useRemoveOperatorMember>)
  })

  it('shows loading skeletons', () => {
    vi.mocked(operatorHooks.useOperatorMembers).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof operatorHooks.useOperatorMembers>)

    render(<OperatorUsersModule accountId="test-account-id" />, { wrapper })
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders member rows', () => {
    vi.mocked(operatorHooks.useOperatorMembers).mockReturnValue({
      data: [
        {
          id: 'mem-1',
          userId: 'user-1',
          matricule: 'K48-B1-1',
          name: 'Alice',
          memberRole: 'COLLABORATOR',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    } as ReturnType<typeof operatorHooks.useOperatorMembers>)

    render(<OperatorUsersModule accountId="test-account-id" isOwner />, {
      wrapper,
    })
    expect(screen.getByText('K48-B1-1')).toBeInTheDocument()
  })

  it('shows empty state when no members', () => {
    render(<OperatorUsersModule accountId="test-account-id" />, { wrapper })
    expect(screen.getByText('No members yet')).toBeInTheDocument()
  })

  it('shows error state on members tab', () => {
    vi.mocked(operatorHooks.useOperatorMembers).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as ReturnType<typeof operatorHooks.useOperatorMembers>)

    render(<OperatorUsersModule accountId="test-account-id" />, { wrapper })
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })
})

// ── TrafficTable ───────────────────────────────────────────────────────────

describe('TrafficTable', () => {
  it('shows loading state', () => {
    vi.mocked(operatorHooks.useOperatorTraffic).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorTraffic>)

    render(<TrafficTable accountId="test-account-id" />, { wrapper })
    expect(screen.getByText('API Key Calls')).toBeInTheDocument()
    expect(screen.getByText('Member Actions')).toBeInTheDocument()
  })

  it('renders traffic data', () => {
    vi.mocked(operatorHooks.useOperatorTraffic).mockReturnValue({
      data: {
        apiKeyCalls: [
          {
            timestamp: '2024-01-01T10:00:00Z',
            ip: '1.2.3.4',
            endpoint: '/api/v1/test',
            method: 'GET',
            totalInWindow: 5,
          },
        ],
        memberActions: [
          {
            userId: 'u1',
            matricule: 'K48-B1-3',
            action: 'OPERATOR_ACTION',
            endpoint: '/operator/users',
            timestamp: '2024-01-01T10:01:00Z',
          },
        ],
        generatedAt: '2024-01-01T10:05:00Z',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorTraffic>)

    render(<TrafficTable accountId="test-account-id" />, { wrapper })
    expect(screen.getByText('1.2.3.4')).toBeInTheDocument()
    expect(screen.getByText('K48-B1-3')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('shows empty states for both sections', () => {
    vi.mocked(operatorHooks.useOperatorTraffic).mockReturnValue({
      data: { apiKeyCalls: [], memberActions: [], generatedAt: '' },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorTraffic>)

    render(<TrafficTable accountId="test-account-id" />, { wrapper })
    expect(screen.getByText('No API key calls yet')).toBeInTheDocument()
    expect(screen.getByText('No member actions yet')).toBeInTheDocument()
  })
})

// ── ApiKeyPanel ────────────────────────────────────────────────────────────

describe('ApiKeyPanel', () => {
  beforeEach(() => {
    vi.mocked(operatorHooks.useCreateApiKey).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof operatorHooks.useCreateApiKey>)
    vi.mocked(operatorHooks.useRotateApiKey).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof operatorHooks.useRotateApiKey>)
    vi.mocked(operatorHooks.useDeleteApiKey).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof operatorHooks.useDeleteApiKey>)
  })

  it('shows generate button when no key exists', () => {
    vi.mocked(operatorHooks.useOperatorApiKey).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorApiKey>)

    render(<ApiKeyPanel accountId="test-account-id" isOwner={true} />, {
      wrapper,
    })
    expect(screen.getByText('Generate API Key')).toBeInTheDocument()
  })

  it('shows key metadata when key exists', () => {
    vi.mocked(operatorHooks.useOperatorApiKey).mockReturnValue({
      data: {
        id: 'key-1',
        appName: '48Hub',
        createdAt: '2024-01-01T00:00:00Z',
        lastUsedAt: '2024-01-02T00:00:00Z',
        memberRole: 'OWNER',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorApiKey>)

    render(<ApiKeyPanel accountId="test-account-id" isOwner={true} />, {
      wrapper,
    })
    expect(screen.getByText('48Hub')).toBeInTheDocument()
    expect(screen.getByText('Rotate')).toBeInTheDocument()
    expect(screen.getByText('Revoke')).toBeInTheDocument()
  })

  it('hides rotate/revoke for COLLABORATOR role', () => {
    vi.mocked(operatorHooks.useOperatorApiKey).mockReturnValue({
      data: {
        id: 'key-1',
        appName: '48Hub',
        createdAt: '2024-01-01T00:00:00Z',
        memberRole: 'COLLABORATOR',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorApiKey>)

    render(<ApiKeyPanel accountId="test-account-id" isOwner={false} />, {
      wrapper,
    })
    expect(screen.queryByText('Rotate')).not.toBeInTheDocument()
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
  })

  it('shows raw key after creation', async () => {
    vi.mocked(operatorHooks.useOperatorApiKey).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorApiKey>)

    const mockCreate = vi.fn().mockResolvedValue({
      id: 'key-1',
      appName: '48Hub',
      createdAt: '2024-01-01T00:00:00Z',
      // ApiKeyCreatedResponse uses 'key' (not 'rawKey')
      key: 'sk_live_abc123xyz',
    })
    vi.mocked(operatorHooks.useCreateApiKey).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    } as unknown as ReturnType<typeof operatorHooks.useCreateApiKey>)

    render(<ApiKeyPanel accountId="test-account-id" isOwner={true} />, {
      wrapper,
    })

    // Click "Generate API Key" to open the dialog
    await userEvent.click(screen.getByText('Generate API Key'))

    // Fill the application name field in the dialog
    await waitFor(() =>
      expect(screen.getByLabelText('Application Name')).toBeInTheDocument()
    )
    await userEvent.type(screen.getByLabelText('Application Name'), '48Hub')

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /generate/i }))

    // Raw key should be displayed after creation
    await waitFor(() => {
      expect(screen.getByText('sk_live_abc123xyz')).toBeInTheDocument()
    })
  })
})

// ── OperatorDashboardModule ────────────────────────────────────────────────

describe('OperatorDashboardModule', () => {
  it('renders metric cards', () => {
    vi.mocked(operatorHooks.useOperatorUsers).mockReturnValue({
      data: {
        totalElements: 42,
        content: [],
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorUsers>)

    vi.mocked(operatorHooks.useOperatorTraffic).mockReturnValue({
      data: {
        apiKeyCalls: [
          {
            timestamp: '',
            ip: '',
            endpoint: '',
            method: 'GET',
            totalInWindow: 1,
          },
        ],
        memberActions: [],
        generatedAt: '',
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof operatorHooks.useOperatorTraffic>)

    render(<OperatorDashboardModule accountId="test-account-id" />, { wrapper })
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
