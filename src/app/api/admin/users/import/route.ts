import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Forward the multipart/form-data directly to the backend
    const formData = await request.formData()
    const backendUrl = `${config.backend.apiUrl}/admin/users/import`

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        // Do NOT set Content-Type — let fetch set the multipart boundary automatically
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `Backend CSV import error (${response.status}):`,
        'Body length:',
        errorText?.length ?? 0
      )
      // Try to parse as JSON for structured error, fall back to generic
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(errorJson, { status: response.status })
      } catch {
        return NextResponse.json(
          { error: `Import failed: ${response.status}` },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('CSV import route error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV import' },
      { status: 500 }
    )
  }
}
