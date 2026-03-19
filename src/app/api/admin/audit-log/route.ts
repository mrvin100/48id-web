import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventType = searchParams.get('eventType')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'

    const params = new URLSearchParams({
      page,
      size,
    })

    if (userId) params.set('userId', userId)
    if (eventType) params.set('eventType', eventType)
    // Only add date params if they have valid ISO format values
    if (from && from.match(/^\d{4}-\d{2}-\d{2}$/)) {
      params.set('from', `${from}T00:00:00Z`)
    }
    if (to && to.match(/^\d{4}-\d{2}-\d{2}$/)) {
      params.set('to', `${to}T23:59:59Z`)
    }

    const backendUrl = `${config.backend.apiUrl}/admin/audit-log?${params.toString()}`

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API audit-log route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    )
  }
}
