import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

/**
 * GET /api/dashboard/traffic
 * Proxies GET /admin/dashboard/traffic from backend.
 * Returns AggregatedTrafficView: list of all operator accounts with their
 * API key call counts and member activity stats.
 * Requires ADMIN role.
 */
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )

  const response = await fetch(
    `${config.backend.apiUrl}/admin/dashboard/traffic`,
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  )
  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )
  return NextResponse.json(await response.json())
}
