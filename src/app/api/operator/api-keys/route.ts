import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

function requireAccountId(request: NextRequest) {
  return new URL(request.url).searchParams.get('accountId')
}

export async function GET(request: NextRequest) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  const accountId = requireAccountId(request)
  if (!accountId)
    return NextResponse.json(
      { error: 'accountId is required' },
      { status: 400 }
    )

  const response = await fetch(
    `${config.backend.apiUrl}/operator/api-keys?accountId=${accountId}`,
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  )
  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )
  return NextResponse.json(await response.json())
}

export async function POST(request: NextRequest) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  const accountId = requireAccountId(request)
  if (!accountId)
    return NextResponse.json(
      { error: 'accountId is required' },
      { status: 400 }
    )

  const body = await request.json().catch(() => ({}))
  const response = await fetch(
    `${config.backend.apiUrl}/operator/api-keys?accountId=${accountId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )
  return NextResponse.json(await response.json(), { status: 201 })
}

// PUT is handled by /api/operator/api-keys/rotate route (separate file)
// This is intentionally absent here to avoid route conflicts

export async function DELETE(request: NextRequest) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  const accountId = requireAccountId(request)
  if (!accountId)
    return NextResponse.json(
      { error: 'accountId is required' },
      { status: 400 }
    )

  const response = await fetch(
    `${config.backend.apiUrl}/operator/api-keys?accountId=${accountId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${jwtToken}` } }
  )
  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )
  return new NextResponse(null, { status: 204 })
}
