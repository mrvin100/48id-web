import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/env'

/** POST /api/auth/accept-operator-invite — accept an operator account invite token */
export async function POST(request: NextRequest) {
  let body: { token: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }

  if (!body.token) {
    return NextResponse.json(
      { success: false, message: 'Token is required' },
      { status: 400 }
    )
  }

  const response = await fetch(
    `${config.backend.apiUrl}/auth/accept-operator-invite`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: body.token }),
    }
  )

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let message = 'Invite acceptance failed'
    try {
      const json = JSON.parse(text)
      message = json.message || message
    } catch {
      // ignore
    }
    return NextResponse.json(
      { success: false, message },
      { status: response.status }
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
