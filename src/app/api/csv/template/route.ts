import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Create CSV template content
    const headers = [
      'matricule',
      'email',
      'name',
      'phone',
      'batch',
      'specialization',
    ]
    const exampleRow = [
      'K48-2024-001',
      'john.doe@k48.io',
      'John Doe',
      '+237600000000',
      '2024',
      'Software Engineering',
    ]

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n')

    // Return as downloadable CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition':
          'attachment; filename="48id_import_template.csv"',
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
