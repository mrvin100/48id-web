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
  const jwtToken = await getToken()
  if (!jwtToken) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const response = await fetch(`${config.backend.apiUrl}/operator/accounts/${id}/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
  return new NextResponse(null, { status: 201 })
}
