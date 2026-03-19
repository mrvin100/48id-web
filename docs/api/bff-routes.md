# BFF Route Reference

All BFF (Backend For Frontend) route handlers in `src/app/api/`.

The BFF layer:
- Reads the JWT from the `k48_access_token` HttpOnly cookie
- Forwards requests to 48ID with `Authorization: Bearer <token>`
- Never exposes raw tokens in response bodies

---

## Authentication Routes

### POST /api/auth/login
Authenticates an admin and sets HttpOnly cookies.

**Request:** `{ matricule: string, password: string }`  
**Response:** `{ success: boolean, user: User, message: string }`  
**Cookies set:** `k48_access_token` (15 min), `k48_refresh_token` (7 days)  
**Errors:** 400 invalid input, 401 bad credentials, 403 non-admin role

---

### POST /api/auth/refresh
Silently refreshes the access token using the refresh token cookie.

**Request:** none (reads cookie automatically)  
**Response:** `{ success: boolean, user: User }`  
**Cookies updated:** `k48_access_token`  
**Errors:** 401 no/invalid refresh token

---

### POST /api/auth/logout
Terminates the session on both client and backend.

**Request:** none  
**Response:** `{ success: boolean }`  
**Cookies cleared:** `k48_access_token`, `k48_refresh_token`

---

### POST /api/auth/activate
Activates a provisioned account using the email token.

**Request:** `{ token: string }`  
**Response:** `{ success: boolean, message: string }`  
**Errors:** 400 invalid/used/expired token

---

### POST /api/auth/reset-password
Resets a user's password using the email token. Tokens are single-use.

**Request:** `{ token: string, newPassword: string }`  
**Response:** `{ success: boolean, message: string }`  
**Errors:** 400 invalid/used/expired token, 400 password policy violation

---

## User Routes

### GET /api/users
Returns a paginated list of users.

**Query params:** `page`, `size`, `sort`, `status`, `batch`, `role`, `search`  
**Response:** Spring Page `{ content: User[], totalElements, totalPages, ... }`

---

### GET /api/users/[id]
Returns a single user by ID.

**Response:** `User`

---

### PUT /api/users/[id]
Updates a user's profile fields.

**Request:** `{ name?, phone?, batch?, specialization? }`  
**Response:** `User`

---

### PUT /api/users/[id]/status
Changes a user's status (ACTIVE / SUSPENDED).

**Request:** `{ status: "ACTIVE" | "SUSPENDED" }`  
**Response:** `User`

---

### POST /api/users/[id]/reset-password
Forces a password reset email for a user.

**Request:** none  
**Response:** `{ message: string }`

---

## Admin Routes

### GET /api/admin/audit-log
Returns paginated audit events with resolved user names.

**Query params:** `page`, `size`, `eventType`, `userId`, `from`, `to`  
**Response:** Spring Page with enriched `{ userName, userMatricule }` fields  
**Note:** BFF resolves unique `userId`s in parallel before returning

---

### GET /api/admin/api-keys
Returns all registered API keys.

**Response:** `ApiKey[]`

---

### POST /api/admin/api-keys
Creates a new API key. Returns the raw key value once.

**Request:** `{ appName: string, description?: string }`  
**Response:** `{ id, appName, key, createdAt }`

---

### DELETE /api/admin/api-keys/[id]
Revokes an API key.

**Response:** 204 No Content

---

### POST /api/admin/api-keys/[id]/rotate
Rotates an API key. Invalidates the current key immediately.

**Response:** `{ id, appName, key, createdAt }`

---

### POST /api/admin/users/import
Imports users from a CSV file (multipart/form-data).

**Request:** `FormData` with `file` field (CSV)  
**Response:** `{ imported: number, failed: number, errors: CsvRowError[] }`  
**CSV format:** `matricule,email,name,phone,batch,specialization` (6 columns, no password)

---

## Dashboard Routes

### GET /api/dashboard/metrics
Returns user count metrics.

**Response:** `{ totalUsers, activeUsers, pendingUsers, suspendedUsers }`

---

### GET /api/dashboard/login-activity
Returns 7-day login activity for the chart.

**Response:** `{ date, loginSuccess, loginFailure }[]`

---

### GET /api/dashboard/recent-activity
Returns the last 10 audit events.

**Response:** `AuditEvent[]`

---

## CSV Routes

### GET /api/csv/template
Downloads the official CSV import template.

**Response:** `text/csv` file download  
**Filename:** `48id_import_template.csv`  
**Columns:** `matricule,email,name,phone,batch,specialization`

---

## Health

### GET /api/health
Returns application health status.

**Response:** `{ status: "ok" }`
