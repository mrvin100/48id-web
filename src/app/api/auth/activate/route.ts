import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 })
    }

    const response = await fetch(`${config.backend.apiUrl}/auth/activate-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      // Backend returns ProblemDetail: { detail, title, ... }
      const message = data.detail ?? data.message ?? data.error ?? 'Activation failed'
      return NextResponse.json({ success: false, message }, { status: response.status })
    }

    return NextResponse.json({ success: true, message: data.message })
  } catch (error) {
    console.error('Activation BFF error:', error)
    return NextResponse.json({ success: false, message: 'Activation service unavailable' }, { status: 503 })
  }
}
