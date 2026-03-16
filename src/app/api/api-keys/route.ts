import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // API keys list endpoint will be implemented in Sprint 5
    return NextResponse.json(
      { message: 'API keys list endpoint - implementation coming in Sprint 5' },
      { status: 501 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest) {
  try {
    // API key creation endpoint will be implemented in Sprint 5
    return NextResponse.json(
      {
        message:
          'API key creation endpoint - implementation coming in Sprint 5',
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
