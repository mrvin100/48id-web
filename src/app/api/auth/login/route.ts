import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    // Authentication logic will be implemented in Sprint 1
    return NextResponse.json(
      {
        message: 'Authentication endpoint - implementation coming in Sprint 1',
      },
      { status: 501 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
