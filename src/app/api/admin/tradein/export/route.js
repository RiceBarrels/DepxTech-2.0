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

    // Fetch all tradable products
    const { data: products, error } = await supabaseAdmin
      .from('tradable_products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tradable products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tradable products' },
        { status: 500 }
      )
    }

    // Convert to CSV
    const headers = [
      'id',
      'title',
      'des',
      'category',
      'brand',
      'series',
      'new_price',
      'good_price',
      'okay_price',
      'bad_price',
      'broken_price',
      'new_def',
      'good_def',
      'okay_def',
      'bad_def',
      'broken_def',
      'imgs',
      'brand_img',
      'trades',
      'views',
      'likes',
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
        `"${(product.category || '').replace(/"/g, '""')}"`,
        `"${(product.brand || '').replace(/"/g, '""')}"`,
        `"${(product.series || '').replace(/"/g, '""')}"`,
        product.new_price || 0,
        product.good_price || 0,
        product.okay_price || 0,
        product.bad_price || 0,
        product.broken_price || 0,
        `"${(product.new_def || '').replace(/"/g, '""')}"`,
        `"${(product.good_def || '').replace(/"/g, '""')}"`,
        `"${(product.okay_def || '').replace(/"/g, '""')}"`,
        `"${(product.bad_def || '').replace(/"/g, '""')}"`,
        `"${(product.broken_def || '').replace(/"/g, '""')}"`,
        `"${JSON.stringify(product.imgs || []).replace(/"/g, '""')}"`,
        product.brand_img || '',
        product.trades || 0,
        product.views || 0,
        product.likes || 0,
        product.created_at || ''
      ]
      csvRows.push(row.join(','))
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tradable-products-${new Date().toISOString().split('T')[0]}.csv"`
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

