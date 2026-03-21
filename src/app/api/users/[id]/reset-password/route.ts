import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const response = await fetch(`${config.backend.apiUrl}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
