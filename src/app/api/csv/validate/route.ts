import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    // CSV validation endpoint will be implemented in Sprint 4
    return NextResponse.json(
      {
        message: 'CSV validation endpoint - implementation coming in Sprint 4',
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
