import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'

async function fetchUser(userId: string, token: string): Promise<{ name: string; matricule: string } | null> {
  try {
    const res = await fetch(`${config.backend.apiUrl}/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const u = await res.json()
    return { name: u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(), matricule: u.matricule ?? '' }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value

    if (!jwtToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventType = searchParams.get('eventType')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = searchParams.get('page') || '0'
    const size = searchParams.get('size') || '20'

    const params = new URLSearchParams({ page, size })
    if (userId) params.set('userId', userId)
    if (eventType) params.set('eventType', eventType)
    if (from && from.match(/^\d{4}-\d{2}-\d{2}$/)) params.set('from', `${from}T00:00:00Z`)
    if (to && to.match(/^\d{4}-\d{2}-\d{2}$/)) params.set('to', `${to}T23:59:59Z`)

    const response = await fetch(`${config.backend.apiUrl}/admin/audit-log?${params}`, {
      headers: { Authorization: `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    // Resolve unique userIds to user details in parallel
    const uniqueUserIds: string[] = [...new Set<string>(
      (data.content as { userId: string }[]).map(e => e.userId).filter(Boolean)
    )]

    const userMap = new Map<string, { name: string; matricule: string }>()
    await Promise.all(
      uniqueUserIds.map(async id => {
        const user = await fetchUser(id, jwtToken)
        if (user) userMap.set(id, user)
      })
    )

    // Enrich events with resolved user info
    data.content = (data.content as { userId: string; [key: string]: unknown }[]).map(event => ({
      ...event,
      userName: userMap.get(event.userId)?.name ?? 'Unknown',
      userMatricule: userMap.get(event.userId)?.matricule ?? event.userId,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('API audit-log route error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}
