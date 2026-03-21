# Contributing to 48ID Web

Thank you for your interest in contributing to 48ID Web! 🎉

This document provides guidelines for contributing to the project.

## Quick Start for Development

### Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org/))
- **pnpm 9+** — `npm install -g pnpm`
- **48ID backend running** — see [48ID setup](https://github.com/mrvin100/48id)
- **Git**

### Setup Development Environment

```bash
# 1. Clone the repository
git clone https://github.com/mrvin100/48id-web.git
cd 48id-web

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Start the dev server
pnpm dev

# 5. Run type check
pnpm type-check

# 6. Run tests
pnpm test
```

The portal starts at **http://localhost:3000**

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/WEB-<STORY-ID>-<short-description>

# Example:
git checkout -b feature/WEB-04-03-user-edit-form
```

**Branch naming convention:**
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring

### 2. Make Your Changes

Follow the **layered architecture** — every feature must go through all layers:

```
BFF Route Handler → lib/api function → TanStack Query hook → Module component → Page (thin wrapper)
```

See [Architecture Guide](docs/guide/architecture.md) for the full pattern.

### 3. Test Your Changes

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests (interactive)
pnpm cy:open

# E2E tests (headless)
pnpm cy:run
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add user edit form (WEB-04-03)"
```

**Commit message format:**
```text
<type>: <description> (<story-id>)

Examples:
feat: add user edit form (WEB-04-03)
fix: session lost on page refresh (WEB-02-03)
docs: update architecture guide
refactor: move reset-password logic to module
```

**Commit types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `refactor` — Code refactoring
- `test` — Test additions or updates
- `chore` — Build, CI, or tooling changes

### 5. Push and Create Pull Request

```bash
git push -u origin feature/WEB-04-03-user-edit-form
```

Then create a Pull Request on GitHub.

---

## Code Standards

### Architecture Rules

Every feature **must** follow this exact data flow — no exceptions:

```
Component → Custom Hook → TanStack Query → lib/api function → BFF Route Handler → 48ID Backend
```

| Layer | Location | Rule |
|-------|----------|------|
| **Page** | `app/(dashboard)/*/page.tsx` | Thin wrapper only — renders the module, nothing else |
| **Module** | `components/modules/*/` | UI logic, uses hooks, no direct API calls |
| **Hook** | `hooks/use-*.ts` | TanStack Query `useQuery` / `useMutation` wrapping api functions |
| **API** | `lib/api/*.ts` | Pure HTTP functions using `apiClient` |
| **BFF** | `app/api/*/route.ts` | Proxy to 48ID, reads JWT from cookie, forwards with Bearer token |

### TypeScript

- Strict mode is enabled — no `any`, no `@ts-ignore`
- All props and return types must be explicitly typed
- Use `interface` for object shapes, `type` for unions/aliases
- Export types from `types/` for shared interfaces

### Naming Conventions

- **Components:** `PascalCase` (e.g., `UserDetailSheet`)
- **Hooks:** `camelCase` prefixed with `use` (e.g., `useUsers`)
- **API functions:** `camelCase` in an object (e.g., `usersApi.getUsers`)
- **Files:** `kebab-case` (e.g., `user-detail-sheet.tsx`)
- **Routes:** always use `ROUTES.*` constants from `lib/routes.ts` — never hardcode strings

### Route Constants

All routes must be defined in `lib/routes.ts` and referenced by constant:

```typescript
// ✅ Correct
router.push(ROUTES.DASHBOARD)
router.push(ROUTES.API.AUTH.LOGIN)

// ❌ Wrong
router.push('/dashboard')
router.push('/api/auth/login')
```

### Query Keys

All TanStack Query keys must use the factory functions from `lib/query-keys.ts`:

```typescript
// ✅ Correct
queryKey: usersKeys.list(filters)
queryKey: auditKeys.log(filters)

// ❌ Wrong
queryKey: ['users', filters]
```

### BFF Route Handlers

Every BFF route must:
1. Read the JWT from the cookie using `config.auth.jwtCookieName`
2. Return 401 if no token
3. Forward the token as `Authorization: Bearer <token>` to the backend
4. Never return raw tokens in the response body
5. Read `data.detail` (not `data.message`) from backend `ProblemDetail` errors

```typescript
// Standard BFF pattern
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value
  if (!jwtToken) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const response = await fetch(`${config.backend.apiUrl}/admin/resource`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  })
  if (!response.ok) return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
  return NextResponse.json(await response.json())
}
```

### Components

- Pages are **thin wrappers** — they only import and render the module
- Modules handle all UI logic and use hooks
- Never call `fetch` or `apiClient` directly inside a component
- Use `ROUTES.*` constants for all navigation

---

## Project Structure

```
48id-web/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Public pages: login, activate-account, reset-password
│   │   ├── (dashboard)/          # Protected pages: dashboard, users, audit, api-keys, settings
│   │   └── api/                  # BFF Route Handlers
│   │       ├── auth/             # login, logout, refresh, activate, reset-password
│   │       ├── users/            # user list, user detail, status, reset-password
│   │       ├── admin/            # audit-log, api-keys, users/import
│   │       ├── dashboard/        # metrics, login-activity, recent-activity
│   │       └── csv/              # template, import, validate
│   ├── components/
│   │   ├── modules/              # Feature modules (one folder per feature)
│   │   │   ├── auth/             # login, logout, activate-account, reset-password
│   │   │   ├── users/            # user table, detail sheet, action menu
│   │   │   ├── dashboard/        # metric cards, activity chart, health badge
│   │   │   ├── csv-import/       # dropzone, preview, result summary
│   │   │   ├── audit/            # audit table, event badge
│   │   │   ├── api-keys/         # key table, create dialog, rotate/revoke
│   │   │   └── settings/         # profile form, password change
│   │   ├── ui/                   # shadcn/ui — do not edit directly
│   │   ├── global/               # PageHeader, SubmitButton
│   │   └── forms/                # Reusable form primitives
│   ├── hooks/                    # TanStack Query hooks
│   │   ├── use-users.ts
│   │   ├── use-dashboard.ts
│   │   ├── use-audit.ts
│   │   ├── use-api-keys.ts
│   │   ├── use-provisioning.ts
│   │   ├── use-activation.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── api/                  # HTTP functions (one file per domain)
│   │   │   ├── client.ts         # ky instance with silent refresh
│   │   │   ├── users.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── audit.ts
│   │   │   ├── api-keys.ts
│   │   │   ├── provisioning.ts
│   │   │   ├── activation.ts
│   │   │   └── index.ts
│   │   ├── routes.ts             # All route constants
│   │   ├── query-keys.ts         # TanStack Query key factories
│   │   ├── query-client.ts       # QueryClient configuration
│   │   └── env.ts                # Environment configuration
│   ├── services/
│   │   └── auth.service.ts       # Login/logout/refresh service
│   ├── stores/
│   │   ├── auth-store.ts         # Zustand auth store (persisted)
│   │   ├── ui-store.ts           # Zustand UI store (sidebar, theme)
│   │   └── csv-store.ts          # Zustand CSV import state
│   └── types/                    # TypeScript interfaces
├── middleware.ts                  # Route protection and silent refresh
├── cypress/                       # E2E tests
├── docs/                          # Documentation
└── .env.example                   # Environment variable template
```

---

## Testing Standards

### Unit Tests (Vitest + React Testing Library)

```typescript
// hooks/use-users.test.ts
describe('useUsers', () => {
  it('returns paginated users', async () => {
    // Given
    server.use(http.get('/api/users', () => HttpResponse.json(mockUsers)))

    // When
    const { result } = renderHook(() => useUsers(), { wrapper: QueryWrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Then
    expect(result.current.data?.content).toHaveLength(2)
  })
})
```

### E2E Tests (Cypress)

```typescript
// cypress/e2e/auth/login.cy.ts
describe('Login', () => {
  it('redirects admin to dashboard', () => {
    cy.visit('/login')
    cy.get('[name=matricule]').type('K48-2024-001')
    cy.get('[name=password]').type('AdminPass@123')
    cy.get('[type=submit]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

### Coverage Target

- 80%+ for new code
- Run `pnpm test:coverage` to check

---

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Bug?** Open a GitHub Issue
- **Feature idea?** Open a GitHub Issue with `[Feature Request]` tag
- **Security issue?** Email security@k48.io — do not open a public issue

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to 48ID Web! 🚀
