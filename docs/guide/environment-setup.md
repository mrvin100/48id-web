# Environment Setup Guide

This guide explains how to configure 48ID Web for local development and production.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/mrvin100/48id-web.git
cd 48id-web
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Start dev server (requires 48ID backend running)
pnpm dev
```

The portal starts at **http://localhost:3000**

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | [Download](https://nodejs.org/) |
| pnpm | 9+ | `npm install -g pnpm` |
| 48ID backend | latest | Must be running on port 8080 |

---

## Environment Variables

All configuration is done through environment variables. The `.env.example` file documents every variable.

### Key Variables

| Variable | Description | Dev Default | Required |
|----------|-------------|-------------|----------|
| `BACKEND_URL` | 48ID backend base URL | `http://localhost:8080` | ✅ |
| `NEXT_PUBLIC_APP_URL` | This app's public URL | `http://localhost:3000` | ✅ |
| `JWT_COOKIE_NAME` | Access token cookie name | `auth-token` | ✅ |
| `REFRESH_COOKIE_NAME` | Refresh token cookie name | `refresh-token` | ✅ |
| `JWT_SECRET` | Secret for JWT verification in middleware | `your-secret-key-...` | ✅ prod |
| `NODE_ENV` | Environment | `development` | auto |

### Security Variables (Production Only)

```bash
# Must be set in production — never commit these
JWT_SECRET=<strong-random-secret-matching-48id-backend>
NEXT_PUBLIC_APP_URL=https://admin.k48.io
BACKEND_URL=https://api.k48.io
```

---

## Development Setup

### 1. Start the 48ID backend

Follow the [48ID setup guide](https://github.com/mrvin100/48id#-quick-start). The backend must be running before starting the frontend.

```bash
# In the 48id directory
docker compose up -d db redis mailpit
./gradlew bootRun
```

### 2. Configure the frontend

```bash
cp .env.example .env
# Edit .env if your backend runs on a different port
```

### 3. Start the dev server

```bash
pnpm dev
```

### 4. Verify

- Portal: http://localhost:3000 → redirects to `/login`
- Log in with an admin account bootstrapped in 48ID
- Mailpit (email testing): http://localhost:8025

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint check |
| `pnpm type-check` | TypeScript check (no emit) |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:coverage` | Unit tests with coverage report |
| `pnpm cy:open` | Open Cypress interactive runner |
| `pnpm cy:run` | Run Cypress headless |

---

## Docker

### Build and run

```bash
# Build image
docker build -t k48id-web .

# Run with environment file
docker run -p 3000:3000 --env-file .env k48id-web
```

### Health check

```bash
curl http://localhost:3000/api/health
# → { "status": "ok" }
```

---

## Production Setup

### Environment variables

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.k48.io
BACKEND_URL=https://api.k48.io
JWT_SECRET=<must-match-48id-backend-jwt-secret>
JWT_COOKIE_NAME=k48_access_token
REFRESH_COOKIE_NAME=k48_refresh_token
```

### Vercel deployment

1. Connect the repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Build command: `pnpm build`
4. Install command: `pnpm install --frozen-lockfile`
5. Output directory: `.next`

### CORS

Ensure the 48ID backend has `CORS_ALLOWED_ORIGINS` set to include your production domain:

```bash
# In 48ID backend .env
CORS_ALLOWED_ORIGINS=https://admin.k48.io
```

---

## Troubleshooting

### "Authentication required" on all API calls

The JWT cookie name in `.env` must match what the 48ID backend sets. Check `JWT_COOKIE_NAME` and `REFRESH_COOKIE_NAME`.

### Backend connection refused

Verify `BACKEND_URL` in `.env` points to the running 48ID instance. Default is `http://localhost:8080`.

### Hydration mismatch warnings

These are suppressed on the `<html>` tag via `suppressHydrationWarning` (required for `next-themes`). Any other hydration warnings are real bugs — investigate them.

### pnpm not found in WSL

pnpm is installed in Windows. Run `pnpm` commands from PowerShell or Git Bash, not WSL.

### Husky pre-commit fails in WSL

Node is not in the WSL PATH. Use `git commit --no-verify` from WSL, or commit from PowerShell/Git Bash where Node is available.
