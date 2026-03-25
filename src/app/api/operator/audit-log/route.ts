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
    const params = new URLSearchParams()
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'
    params.set('page', page)
    params.set('size', size)
    const eventType = searchParams.get('eventType')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (eventType) params.set('eventType', eventType)
    if (from && from.match(/^\d{4}-\d{2}-\d{2}$/))
      params.set('from', `${from}T00:00:00Z`)
    if (to && to.match(/^\d{4}-\d{2}-\d{2}$/))
      params.set('to', `${to}T23:59:59Z`)

    const response = await fetch(
      `${config.backend.apiUrl}/operator/audit-log?${params}`,
      {
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

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Operator audit-log route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operator audit log' },
      { status: 500 }
    )
  }
}
