import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'
import { config } from '@/lib/env'
import { UserRole } from '@/types/auth.types'

interface TokenPayload {
  role?: string
  roles?: string[] | string
  // Spring Security standard claim
  authorities?: string[] | string
}

/**
 * Get user role from JWT token.
 *
 * We DECODE (not verify) the backend-issued JWT because:
 * - The token is set as an HttpOnly cookie by our own BFF after the backend authenticates the user.
 * - The backend signs it with its own secret, which the frontend does not (and should not) possess.
 * - The cookie being HttpOnly and set server-side is already a trust boundary.
 * - Role information is only used for rendering decisions on the server, not security enforcement.
 *
 * Spring Boot typically encodes roles as:
 *   - roles: ["ROLE_ADMIN"]   (most common)
 *   - role: "ROLE_ADMIN"
 *   - authorities: ["ROLE_ADMIN"]
 */
export const getServerUserRole = async (): Promise<UserRole> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(config.auth.jwtCookieName)?.value
  if (!token) return UserRole.STUDENT

  try {
    // Decode without verification — backend JWT, trusted via HttpOnly cookie
    const payload = decodeJwt(token) as TokenPayload

    // Collect role candidates from all possible claim locations.
    // The backend encodes roles in various formats — we handle all of them:
    //   - Array of individual strings:  ["ROLE_ADMIN"]
    //   - Array with comma-separated:   ["STUDENT,ROLE_OPERATOR"]  ← seen in logs
    //   - Single string:                "ROLE_STUDENT"
    //   - Comma-separated string:       "STUDENT,ROLE_OPERATOR"
    const rawTokens: string[] = []

    const addClaim = (value: string | string[] | undefined) => {
      if (!value) return
      const items = Array.isArray(value) ? value : [value]
      for (const item of items) {
        // Split on comma to handle "STUDENT,ROLE_OPERATOR" as a single element
        rawTokens.push(
          ...String(item)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        )
      }
    }

    addClaim(payload.roles)
    addClaim(payload.role)
    addClaim(payload.authorities)

    if (rawTokens.length === 0) {
      console.warn('getServerUserRole: No role claims found in token payload')
      return UserRole.STUDENT
    }

    // Normalize: strip "ROLE_" prefix and uppercase
    const normalized = rawTokens.map(r =>
      String(r)
        .replace(/^ROLE_/i, '')
        .toUpperCase()
    )

    // Priority: ADMIN > STUDENT > OPERATOR
    // OPERATOR is a capability granted to students — not a standalone primary role.
    // A student with ROLE_OPERATOR is still STUDENT for page routing purposes;
    // they access operator features via the operator store, not by being "logged in as OPERATOR".
    if (normalized.includes('ADMIN')) return UserRole.ADMIN
    if (normalized.includes('STUDENT')) return UserRole.STUDENT
    if (normalized.includes('OPERATOR')) return UserRole.OPERATOR

    console.warn('getServerUserRole: No recognized role found in:', normalized)
    return UserRole.STUDENT
  } catch (error) {
    console.error('getServerUserRole: Failed to decode token:', error)
    return UserRole.STUDENT
  }
}
