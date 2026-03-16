import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Audit logs endpoint will be implemented in Sprint 5
    return NextResponse.json(
      { message: 'Audit logs endpoint - implementation coming in Sprint 5' },
      { status: 501 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
