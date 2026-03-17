import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const batch = searchParams.get('batch')
    const role = searchParams.get('role')
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'
    const sort = searchParams.get('sort') || 'createdAt,desc'

    // Build query parameters for backend
    const params = new URLSearchParams({
      page,
      size,
      sort,
    })

    if (status) params.append('status', status)
    if (batch) params.append('batch', batch)
    if (role) params.append('role', role)

    // Call the backend admin users endpoint
    const backendUrl = `${config.backend.apiUrl}/admin/users?${params.toString()}`

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${request.headers.get('authorization')?.replace('Bearer ', '')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch users from backend' },
      { status: 500 }
    )
  }
}
