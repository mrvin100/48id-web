import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

/**
 * PUT /api/operator/api-keys/rotate?accountId=xxx
 * Rotates the operator API key — backend endpoint: PUT /operator/api-keys/rotate?accountId=xxx
 */
export async function PUT(request: NextRequest) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )

  const accountId = new URL(request.url).searchParams.get('accountId')
  if (!accountId)
    return NextResponse.json(
      { error: 'accountId is required' },
      { status: 400 }
    )

  const response = await fetch(
    `${config.backend.apiUrl}/operator/api-keys/rotate?accountId=${accountId}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${jwtToken}` },
    }
  )
  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )
  return NextResponse.json(await response.json())
}
