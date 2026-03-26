import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value
  if (!jwtToken)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  // Traffic endpoint resolves account from JWT membership server-side
  const response = await fetch(`${config.backend.apiUrl}/operator/traffic`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  })
  if (!response.ok)
    return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
  return NextResponse.json(await response.json())
}
