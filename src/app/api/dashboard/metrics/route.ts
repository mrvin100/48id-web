import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Dashboard metrics endpoint will be implemented in Sprint 2
    return NextResponse.json(
      {
        message:
          'Dashboard metrics endpoint - implementation coming in Sprint 2',
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
