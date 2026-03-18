import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const backendUrl = `${config.backend.apiUrl}/admin/users/${id}`

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
    console.error('API user detail route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const backendUrl = `${config.backend.apiUrl}/admin/users/${id}`

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('API user update route error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
