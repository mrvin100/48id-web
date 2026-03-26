import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value
  if (!jwtToken)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const accountId = new URL(request.url).searchParams.get('accountId')
  if (!accountId)
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 })

  const response = await fetch(
    `${config.backend.apiUrl}/operator/dashboard/metrics?accountId=${accountId}`,
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  )
  if (!response.ok)
    return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
  return NextResponse.json(await response.json())
}
