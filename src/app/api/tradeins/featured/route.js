import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '6')
  const category = searchParams.get('category')

  try {
    let query = supabase
      .from('tradable_products')
      .select('id, title, category, base_price, good_percent, imgs, brand')
      .eq('is_featured', true)
      .order('base_price', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching featured products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch featured products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
