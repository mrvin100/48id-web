# Architecture

## System Overview

48ID Web is a **Next.js 15 App Router BFF (Backend For Frontend)** that provides:

- An admin portal for managing users, audit logs, and system settings
- A student portal for identity management and operator account access
- An operator board for managing API keys, consumers, and traffic

```
Browser ──► Next.js BFF (localhost:3000) ──► Spring Boot Backend (localhost:8080) ──► PostgreSQL
              ↑ HttpOnly cookies                ↑ JWT Bearer / API Key
```

---

## Role System

| Role                 | Source                                     | Primary View                           |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| `ADMIN`              | JWT claim `ROLE_ADMIN`                     | Admin dashboard, users, audit, traffic |
| `STUDENT`            | JWT claim `ROLE_STUDENT`                   | Student dashboard, profile, operators  |
| `STUDENT + OPERATOR` | JWT claims after creating/joining operator | Student view + optional operator mode  |

**Key design decision**: `ROLE_OPERATOR` is a _capability_ granted to students — not a standalone login role. Students always land on their student view first and consciously switch to operator mode via the operator store.

When a student creates an operator account or accepts an invite, the backend grants `ROLE_OPERATOR`. The frontend calls `/api/auth/refresh` immediately to get a new JWT with the updated role (required for all `/operator/*` backend endpoints which use `@PreAuthorize("hasRole('OPERATOR')")`).

---

## Client-Side Operator Mode

Operator mode switching is handled by **Zustand `operator-store`** with `persist` middleware (sessionStorage):

```
Student selects operator → selectOperator() → isOperatorMode=true → JWT refresh → navigate to /dashboard
Dashboard → StudentDashboardWrapper → reads isOperatorMode → renders OperatorDashboardModule
Sidebar → reads isOperatorMode → shows operator tabs with ?accountId=xxx in URLs
Page routes → read accountId from searchParams → render operator-scoped modules
"Back to Student View" → clearOperator() → isOperatorMode=false → student nav restores
Logout → sessionStorage cleared → next login always starts in student view
```

Hydration is handled by `useOperatorHydrated()` which uses `useOperatorContext.persist.onFinishHydration()` — no `useEffect mounted` anti-pattern.

---

## Data Flow

```
Page (server component)
  └─ renders Module (client component)
       └─ calls Hook (TanStack Query)
            └─ calls API function (lib/api/*.ts)
                 └─ HTTP to BFF route (app/api/**/*.ts)
                      └─ HTTP to Spring Boot backend (with JWT from cookie)
```

---

## Module Structure

```
src/
  app/
    api/                    # BFF route handlers
      auth/                 # login, logout, refresh, activate, reset-password
      users/                # admin user management
      admin/                # audit-log, api-keys, csv import
      dashboard/            # metrics, login-activity, recent-activity, traffic
      operator/
        accounts/           # CRUD + invite + members
        users/              # API consumers
        audit-log/          # operator audit
        traffic/            # operator traffic
        api-keys/           # operator API key management
        dashboard/          # operator metrics
    dashboard/              # page routes (server components)
      page.tsx              # role-based: admin → DashboardModule, student → StudentDashboardWrapper
      users/page.tsx        # accountId? → OperatorUsersModule : (admin → UsersModule)
      audit/page.tsx        # accountId? → OperatorAuditPage : (admin → AuditLogModule)
      traffic/page.tsx      # accountId? → OperatorTrafficPage : (admin → AdminTrafficModule)
      api-key/page.tsx      # accountId? → OperatorApiKeyPage : AccessDenied
      api-keys/page.tsx     # admin only → ApiKeysModule
      operators/page.tsx    # student only → StudentOperatorsModule
      profile/page.tsx      # student only → SettingsModule
      settings/page.tsx     # admin only → SettingsModule
      csv-import/page.tsx   # admin only → ProvisioningModule

  components/
    modules/
      dashboard/            # DashboardModule, AdminTrafficModule, StudentDashboardModule,
                            # StudentDashboardWrapper, OperatorDashboardModule
      users/                # UsersModule (admin user management table)
      audit/                # AuditLogModule (with pagination)
      api-keys/             # ApiKeysModule (admin-managed keys)
      operator/             # OperatorUsersModule (Members tab + API Consumers tab),
                            # TrafficTable, ApiKeyPanel, OperatorAuditModule
      student/              # StudentOperatorsModule (create, list, enter, delete)
      auth/                 # Login, Logout, ActivateAccount, ResetPassword, AccessDenied
      csv-import/           # ProvisioningModule
      settings/             # SettingsModule

  hooks/                    # TanStack Query hooks (use-dashboard, use-operator, use-users, etc.)
  lib/
    api/                    # API functions calling BFF routes
    server-role.ts          # Server-side JWT decode (decodeJwt, not verify) → UserRole
    role-utils.ts           # resolvePrimaryRole: ADMIN > STUDENT > OPERATOR
    navigation.ts           # getNavigationForRole, getNavigationForStudent (with accountId in operator URLs)
    routes.ts               # ROUTES constants
    query-keys.ts           # TanStack Query cache keys
  stores/
    auth-store.ts           # User auth state (Zustand + immer)
    operator-store.ts       # Operator mode (Zustand + persist → sessionStorage)
  types/                    # TypeScript interfaces for all API shapes
```

---

## Navigation

The sidebar (`AppSidebar`) is a reactive client component that reads from both the auth store and the operator store:

- **ADMIN**: Dashboard, Users, Audit Logs, Traffic, API Keys, CSV Import
- **STUDENT (default)**: Dashboard, Profile, Operators
- **STUDENT in operator mode**: Dashboard, Users, Traffic, API Key (all with `?accountId=xxx&isOwner=true/false`)
  - Footer shows "Back to Student View" button
  - Header shows selected operator account name + role badge

---

## Key Design Decisions

| Decision                              | Rationale                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| BFF decodes JWT without verification  | Backend signs with its own private key. BFF reads role claims from HttpOnly cookie — trust boundary is the cookie, not signature. |
| `STUDENT > OPERATOR` in role priority | OPERATOR is a capability, not a login role. Students with `ROLE_OPERATOR` must remain in student view by default.                 |
| accountId via URL params              | Server pages need accountId to scope operator data. Zustand store is client-only; URL params bridge server/client.                |
| sessionStorage for operator context   | Persists across navigation, clears on tab close. Multiple tabs = independent operator sessions.                                   |
| JWT refresh on operator enter         | `/operator/*` backend endpoints require `ROLE_OPERATOR` in JWT. Student's initial JWT may lack it until refreshed.                |
