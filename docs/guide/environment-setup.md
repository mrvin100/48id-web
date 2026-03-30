# Environment Setup

## Prerequisites

- Node.js 20+
- pnpm 9+
- 48ID Spring Boot backend running on `localhost:8080`

---

## Quick Start

```bash
cd 48id-web
cp .env.example .env.local    # or create manually
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable              | Required | Default                 | Description                                                                 |
| --------------------- | -------- | ----------------------- | --------------------------------------------------------------------------- |
| `BACKEND_URL`         | ✅       | `http://localhost:8080` | Spring Boot backend base URL                                                |
| `BACKEND_API_PATH`    | ✅       | `/api/v1`               | Backend API path prefix                                                     |
| `JWT_SECRET`          | ✅       | —                       | Secret used to sign BFF-issued JWTs (not used for backend JWT verification) |
| `JWT_COOKIE_NAME`     | ✅       | `auth-token`            | Name of the HttpOnly access token cookie                                    |
| `REFRESH_COOKIE_NAME` | ✅       | `refresh-token`         | Name of the HttpOnly refresh token cookie                                   |

> **Note**: The BFF does NOT verify backend-issued JWTs (different signing key). It decodes them without verification using `decodeJwt` from `jose` to read role claims. This is safe because the cookie is HttpOnly and set server-side.

---

## Available Scripts

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint with --fix
pnpm format       # Prettier formatting
pnpm test         # Vitest unit tests
pnpm test --run   # Run tests once (CI mode)
pnpm cy:open      # Cypress interactive
pnpm cy:run       # Cypress headless
```

---

## Authentication Flow

1. User submits matricule + password at `/login`
2. BFF calls backend `POST /api/v1/auth/login`
3. Backend returns `access_token` + `refresh_token`
4. BFF sets both as HttpOnly cookies and stores user data in auth store
5. Server components read the cookie to get the role via `getServerUserRole()` (JWT decode, no verification)
6. Client components read user from `useAuthStore()`

### Operator Mode

When a student creates or enters an operator account:

1. Frontend calls `POST /api/auth/refresh` to get a new JWT with `ROLE_OPERATOR`
2. `useOperatorContext().selectOperator(account)` sets `isOperatorMode = true` in sessionStorage
3. Sidebar switches to operator navigation tabs with `?accountId=xxx` in URLs
4. Server pages read `accountId` from `searchParams` to scope operator data

---

## Troubleshooting

| Issue                                    | Fix                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 403 on operator endpoints                | Call `/api/auth/refresh` first — student JWT may not have `ROLE_OPERATOR` yet                                                |
| Student sees operator tabs on login      | `logout()` now clears sessionStorage — if persisting, clear manually in DevTools → Application → Session Storage             |
| "No recognized role" in server logs      | Backend JWT encodes roles as `"STUDENT,ROLE_OPERATOR"` (comma-separated single string) — already handled by `server-role.ts` |
| Build fails with `.next/dev` type errors | Run `rm -rf .next` then `pnpm build`                                                                                         |
