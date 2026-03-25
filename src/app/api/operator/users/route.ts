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

    const response = await fetch(
      `${config.backend.apiUrl}/operator/users?${params}`,
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
    console.error('Operator users route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operator users' },
      { status: 500 }
    )
  }
}
