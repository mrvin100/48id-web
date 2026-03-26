import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

// GET /api/operator/accounts — list caller's accounts
export async function GET() {
  const jwtToken = await getToken()
  if (!jwtToken) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const response = await fetch(`${config.backend.apiUrl}/operator/accounts`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  })
  if (!response.ok) return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
  return NextResponse.json(await response.json())
}

// POST /api/operator/accounts — create account
export async function POST(request: NextRequest) {
  const jwtToken = await getToken()
  if (!jwtToken) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json()
  const response = await fetch(`${config.backend.apiUrl}/operator/accounts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
  return NextResponse.json(await response.json(), { status: 201 })
}
