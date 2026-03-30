import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )

  const { id, memberId } = await params
  const response = await fetch(
    `${config.backend.apiUrl}/operator/accounts/${id}/members/${memberId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${jwtToken}` } }
  )
  if (!response.ok) {
    let message = `Backend error: ${response.status}`
    try {
      const text = await response.text()
      if (text) {
        const json = JSON.parse(text)
        message =
          json.detail ?? json.message ?? json.error ?? json.title ?? message
      }
    } catch {
      /* ignore */
    }
    return NextResponse.json({ error: message }, { status: response.status })
  }
  return new NextResponse(null, { status: 204 })
}
