import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const id = searchParams.get('id') || ''

  try {
    let query = supabase
      .from('tradable_products')
      .select('*', { count: 'exact' })

    // If ID is provided, fetch specific tradable product by ID
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

    const { data: tradableProducts, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) {
      console.error('Error fetching tradable products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tradable products' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil(count / limit)

    return NextResponse.json({ 
      tradableProducts, 
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

export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      title,
      des,
      new_price,
      good_price,
      okay_price,
      bad_price,
      broken_price,
      category = [],
      new_def,
      good_def,
      okay_def,
      bad_def,
      broken_def,
      imgs = []
    } = body

    // Validate required fields
    if (!title || !new_price || !good_price || !okay_price || !bad_price || !broken_price ||
        !new_def || !good_def || !okay_def || !bad_def || !broken_def) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: tradableProduct, error } = await supabase
      .from('tradable_products')
      .insert([{
        title,
        des,
        new_price: parseFloat(new_price),
        good_price: parseFloat(good_price),
        okay_price: parseFloat(okay_price),
        bad_price: parseFloat(bad_price),
        broken_price: parseFloat(broken_price),
        category,
        new_def,
        good_def,
        okay_def,
        bad_def,
        broken_def,
        imgs
      }])
      .select()

    if (error) {
      console.error('Error creating tradable product:', error)
      return NextResponse.json(
        { error: 'Failed to create tradable product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { tradableProduct: tradableProduct[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Convert numeric fields to proper types
    if (updateData.new_price) updateData.new_price = parseFloat(updateData.new_price)
    if (updateData.good_price) updateData.good_price = parseFloat(updateData.good_price)
    if (updateData.okay_price) updateData.okay_price = parseFloat(updateData.okay_price)
    if (updateData.bad_price) updateData.bad_price = parseFloat(updateData.bad_price)
    if (updateData.broken_price) updateData.broken_price = parseFloat(updateData.broken_price)

    const { data: tradableProduct, error } = await supabase
      .from('tradable_products')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating tradable product:', error)
      return NextResponse.json(
        { error: 'Failed to update tradable product' },
        { status: 500 }
      )
    }

    if (!tradableProduct || tradableProduct.length === 0) {
      return NextResponse.json(
        { error: 'Tradable product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { tradableProduct: tradableProduct[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('tradable_products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tradable product:', error)
      return NextResponse.json(
        { error: 'Failed to delete tradable product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Tradable product deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to increment views
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Product ID and action are required' },
        { status: 400 }
      )
    }

    let updateField = {}
    
    switch (action) {
      case 'increment_views':
        updateField = { views: supabase.raw('views + 1') }
        break
      case 'increment_likes':
        updateField = { likes: supabase.raw('likes + 1') }
        break
      case 'increment_trades':
        updateField = { trades: supabase.raw('trades + 1') }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { data: tradableProduct, error } = await supabase
      .from('tradable_products')
      .update(updateField)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating tradable product stats:', error)
      return NextResponse.json(
        { error: 'Failed to update tradable product stats' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { tradableProduct: tradableProduct[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
