import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    // Call the backend dashboard login activity endpoint
    const backendUrl = `${config.backend.apiUrl}/admin/dashboard/login-activity`

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
  } catch (error) {
    console.error('Error fetching login activity:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch login activity from backend',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
