import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // User list endpoint will be implemented in Sprint 3
    return NextResponse.json(
      { message: 'User list endpoint - implementation coming in Sprint 3' },
      { status: 501 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
