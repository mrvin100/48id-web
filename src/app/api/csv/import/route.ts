import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    // CSV import endpoint will be implemented in Sprint 4
    return NextResponse.json(
      { message: 'CSV import endpoint - implementation coming in Sprint 4' },
      { status: 501 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
