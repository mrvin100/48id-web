import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${config.backend.apiUrl}/admin/dashboard/traffic`,
      {
        signal: AbortSignal.timeout(config.backend.timeout),
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Traffic BFF error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traffic data' },
      { status: 500 }
    )
  }
}
