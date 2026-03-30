import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/env'
import {
  CSV_TEMPLATE_FILENAME,
  buildCsvTemplateContent,
} from '@/lib/validations'

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get(config.auth.jwtCookieName)?.value
    const backendUrl = `${config.backend.apiUrl}/admin/users/import/template`

    // Prefer backend-generated template so frontend download always matches backend contract.
    if (jwtToken) {
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      if (response.ok) {
        const csvContent = await response.text()
        const contentType = response.headers.get('content-type') || 'text/csv'
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${CSV_TEMPLATE_FILENAME}"`,
          },
          status: 200,
        })
      }
    }

    // Fallback template in same centralized format.
    const csvContent = buildCsvTemplateContent()

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${CSV_TEMPLATE_FILENAME}"`,
      },
      status: 200,
    })
  } catch (error) {
    console.error('CSV template error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV template' },
      { status: 500 }
    )
  }
}
