import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // Fetch all offers
    const { data: offers, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching offers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch offers' },
        { status: 500 }
      )
    }

    // Convert to CSV
    const headers = [
      'id',
      'title',
      'description',
      'discount_percentage',
      'discount_amount',
      'start_date',
      'end_date',
      'is_active',
      'image_url',
      'code',
      'min_purchase_amount',
      'max_discount_amount',
      'applicable_categories',
      'created_at',
      'updated_at'
    ]

    const csvRows = [
      headers.join(',')
    ]

    offers.forEach(offer => {
      const row = [
        offer.id || '',
        `"${(offer.title || '').replace(/"/g, '""')}"`,
        `"${(offer.description || '').replace(/"/g, '""')}"`,
        offer.discount_percentage || '',
        offer.discount_amount || '',
        offer.start_date || '',
        offer.end_date || '',
        offer.is_active !== undefined ? offer.is_active : true,
        offer.image_url || '',
        offer.code || '',
        offer.min_purchase_amount || '',
        offer.max_discount_amount || '',
        `"${JSON.stringify(offer.applicable_categories || []).replace(/"/g, '""')}"`,
        offer.created_at || '',
        offer.updated_at || ''
      ]
      csvRows.push(row.join(','))
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="offers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error in export route:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

