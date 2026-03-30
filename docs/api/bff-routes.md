# BFF Route Reference

All BFF (Backend For Frontend) route handlers live in `src/app/api/`.

The BFF layer:

- Reads the JWT from the `auth-token` HttpOnly cookie (name configured via `JWT_COOKIE_NAME` env var)
- Forwards authenticated requests to the 48ID Spring Boot backend
- Handles response serialization and error wrapping
- Surfaces backend `ProblemDetail` error messages (`json.detail`) as `{ error: string }` to the frontend

---

## Authentication Routes

### `POST /api/auth/login`

Authenticates a user, sets `auth-token` + `refresh-token` HttpOnly cookies, stores user data in auth store.

**Request body:**

```json
{ "matricule": "K48-B1-1", "password": "SecurePass123!" }
```

**Response (200):** User object including `id, matricule, email, name, roles, status, batch, specialization, lastLoginAt`.
All users redirect to `/dashboard`. Role-based view is determined client-side.

---

### `POST /api/auth/refresh`

Refreshes the access token using the refresh token cookie. Called automatically when a student creates or enters an operator account (to get `ROLE_OPERATOR` in new JWT).

**Response (200):** New access token set in cookie.

---

### `POST /api/auth/logout`

Invalidates the session server-side and clears both auth cookies. Also removes `48id-operator-context` from sessionStorage client-side.

---

### `POST /api/auth/activate`

Activates a student account using a token from the activation email.

---

### `POST /api/auth/reset-password`

Resets password using a token from the reset email.

---

## User Routes (Admin only)

### `GET /api/users`

List all users with pagination and optional filters (`status`, `batch`, `role`).

### `GET /api/users/[id]`

Get a single user by UUID.

### `PUT /api/users/[id]`

Update user profile fields.

### `POST /api/users/[id]/reset-password`

Force a password reset email to the user.

### `PATCH /api/users/[id]/status`

Change user status (`ACTIVE` | `SUSPENDED` | `INACTIVE`).

---

## Admin Routes

### `GET /api/admin/audit-log`

Paginated audit log. Query params: `page`, `size`, `eventType`, `dateFrom`, `dateTo`.

### `GET /api/admin/api-keys`

List all system API keys.

### `POST /api/admin/api-keys`

Create a new admin-managed API key.

### `DELETE /api/admin/api-keys/[id]`

Revoke an API key.

### `GET /api/admin/users/import` / `POST /api/admin/users/import`

CSV bulk import template download and user provisioning.

---

## Dashboard Routes (Admin only)

### `GET /api/dashboard/metrics`

Returns `totalUsers`, `activeUsers`, `activeSessions`, `pendingActivations`.

### `GET /api/dashboard/login-activity`

Returns 7-day login activity data for charts.

### `GET /api/dashboard/recent-activity`

Returns recent audit events for the activity feed.

### `GET /api/dashboard/traffic`

Returns `AggregatedTrafficView`: list of all operator accounts with their `apiKeyTraffic` (totalCalls, last24h, lastCalledAt) and `memberActivity` (totalActions, last24h, lastActionAt) stats. Admin only.

---

## Operator Account Routes

### `GET /api/operator/accounts`

List all operator accounts the authenticated user belongs to (as owner or collaborator). Used to populate student dashboard and operators page.

### `POST /api/operator/accounts`

Create a new operator account. Caller becomes OWNER. Backend assigns `ROLE_OPERATOR` to user. Frontend calls `/api/auth/refresh` immediately after to get updated JWT.

### `DELETE /api/operator/accounts/[id]`

Delete an operator account (OWNER only).

### `GET /api/operator/accounts/[id]/members`

List all members of an operator account with `id, userId, matricule, name, memberRole, status, createdAt`.

### `POST /api/operator/accounts/[id]/invite`

Invite a student by matricule. Backend creates PENDING membership and sends invite email.

- **404**: No user found with that matricule
- **409 "already an active member"**: User is already active → show error
- **409 "yourself"**: Owner invited themselves → show error
- **409 (other)**: User already has PENDING invite → backend resends email (idempotent)

### `DELETE /api/operator/accounts/[id]/members/[memberId]`

Remove a collaborator by `userId` (not membership record ID). OWNER only. Cannot remove the OWNER.

---

## Operator Feature Routes

### `GET /api/operator/users?accountId=`

Returns paginated list of 48ID users who authenticated externally via this operator account's API key (API consumers). Fields: `userId, matricule, email, name, batch, status, totalCalls, firstSeen, lastSeen`.

### `GET /api/operator/audit-log?accountId=`

Returns paginated audit log scoped to the operator account.

### `GET /api/operator/traffic?accountId=`

Returns traffic data for a specific operator account: `apiKeyCalls[]` and `memberActions[]`.

### `GET /api/operator/api-keys?accountId=`

Returns the API key metadata for the operator account (key value never returned after creation).

### `POST /api/operator/api-keys?accountId=`

Creates a new API key for the operator account. Returns raw key once — must be saved immediately.

### `PUT /api/operator/api-keys/rotate?accountId=`

Rotates the API key. Existing key is immediately invalidated. Returns new raw key once.

### `DELETE /api/operator/api-keys?accountId=`

Revokes the operator API key.

### `GET /api/operator/dashboard?accountId=`

Returns operator-scoped dashboard metrics.

---

## CSV Routes

### `GET /api/csv/template`

Download CSV import template file.

### `POST /api/csv/validate`

Dry-run CSV validation (returns errors without importing).

### `POST /api/csv/import`

Import users from validated CSV.

---

## Health

### `GET /api/health`

Returns `{ status: "ok" }`. Used for monitoring.
