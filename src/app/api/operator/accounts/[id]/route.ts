import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get(config.auth.jwtCookieName)?.value
}

type Params = { params: Promise<{ id: string }> }

/** DELETE /api/operator/accounts/[id] — Delete an operator account (OWNER only) */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const jwtToken = await getToken()
  if (!jwtToken)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )

  const { id } = await params
  const response = await fetch(
    `${config.backend.apiUrl}/operator/accounts/${id}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${jwtToken}` } }
  )
  if (!response.ok)
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    )
  return new NextResponse(null, { status: 204 })
}
