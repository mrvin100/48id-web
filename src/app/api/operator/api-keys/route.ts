import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

export async function GET() {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const response = await fetch(`${config.backend.apiUrl}/operator/api-keys`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  })

  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )

  return NextResponse.json(await response.json())
}

export async function POST() {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const response = await fetch(`${config.backend.apiUrl}/operator/api-keys`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}` },
  })

  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )

  return NextResponse.json(await response.json(), { status: 201 })
}

export async function PUT(request: NextRequest) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const url = new URL(request.url)
  const rotate = url.searchParams.get('action') === 'rotate'

  const response = await fetch(
    `${config.backend.apiUrl}/operator/api-keys${rotate ? '/rotate' : ''}`,
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

export async function DELETE() {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const response = await fetch(`${config.backend.apiUrl}/operator/api-keys`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${jwtToken}` },
  })

  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )

  return new NextResponse(null, { status: 204 })
}
