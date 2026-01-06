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

    // Fetch all products
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Convert to CSV
    const headers = [
      'id',
      'title',
      'des',
      'price',
      'stocks',
      'views',
      'category',
      'imgs',
      'variant_of_id',
      'variant_data',
      'created_at'
    ]

    const csvRows = [
      headers.join(',')
    ]

    products.forEach(product => {
      const row = [
        product.id || '',
        `"${(product.title || '').replace(/"/g, '""')}"`,
        `"${(product.des || '').replace(/"/g, '""')}"`,
        product.price || 0,
        product.stocks || 0,
        product.views || 0,
        `"${JSON.stringify(product.category || []).replace(/"/g, '""')}"`,
        `"${JSON.stringify(product.imgs || []).replace(/"/g, '""')}"`,
        product.variant_of_id || '',
        `"${JSON.stringify(product.variant_data || []).replace(/"/g, '""')}"`,
        product.created_at || ''
      ]
      csvRows.push(row.join(','))
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`
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

