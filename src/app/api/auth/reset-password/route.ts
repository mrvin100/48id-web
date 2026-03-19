import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, message: 'Token and new password are required' }, { status: 400 })
    }

    const response = await fetch(`${config.backend.apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      // Backend returns ProblemDetail: { detail, title, ... }
      const message = data.detail ?? data.message ?? data.error ?? 'Password reset failed'
      return NextResponse.json({ success: false, message }, { status: response.status })
    }

    return NextResponse.json({ success: true, message: data.message })
  } catch (error) {
    console.error('Reset password BFF error:', error)
    return NextResponse.json({ success: false, message: 'Service unavailable' }, { status: 503 })
  }
}
