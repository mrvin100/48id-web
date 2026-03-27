import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const jwtToken = await getToken()
    if (!jwtToken)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )

    const { id } = await params

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${config.backend.apiUrl}/operator/accounts/${id}/invite`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      let message = `Request failed with status ${response.status}`
      try {
        const json = JSON.parse(text)
        message = json.message || json.error || message
      } catch {
        /* ignore */
      }
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return new NextResponse(null, { status: 201 })
  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
