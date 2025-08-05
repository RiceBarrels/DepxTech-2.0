import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const id = searchParams.get('id') || ''
  const inStockOnly = searchParams.get('inStockOnly') === 'true'

  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    // If ID is provided, fetch specific product by ID
    if (id) {
      query = query.eq('id', id)
    } else {
      // Otherwise, use search functionality
      query = query.ilike('title', `%${search}%`)
    }

    // Handle JSONB category filtering (can be combined with search or ID)
    if (category) {
      query = query.contains('category', [category])
    }

    // Handle in-stock filtering
    if (inStockOnly) {
      query = query.gt('stocks', 0)
    }

    const { data: products, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil(count / limit)

    return NextResponse.json({ 
      products, 
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
