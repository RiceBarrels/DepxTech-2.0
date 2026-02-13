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

    if (id) {
      query = query.eq('id', id)
    } else if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
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
      base_price,
      category,
      brand,
      series,
      brand_img,
      imgs = [],
      is_featured = false,
      display_order = 0,
      base_date,
      questions = [],
      depreciation_rate = 0,
    } = body

    if (!title || !base_price || !category || !brand || !series) {
      return NextResponse.json(
        { error: 'Missing required fields: title, base_price, category, brand, series' },
        { status: 400 }
      )
    }

    const { data: tradableProduct, error } = await supabase
      .from('tradable_products')
      .insert([{
        title,
        des,
        base_price: parseFloat(base_price),
        category,
        brand,
        series,
        brand_img,
        imgs,
        is_featured,
        display_order,
        base_date,
        questions,
        depreciation_rate: parseFloat(depreciation_rate),
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

    // Convert numeric fields
    if (updateData.base_price) updateData.base_price = parseFloat(updateData.base_price)
    if (updateData.depreciation_rate) updateData.depreciation_rate = parseFloat(updateData.depreciation_rate)

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

    const columnMap = {
      increment_views: 'views',
      increment_likes: 'likes',
      increment_trades: 'trades',
    }

    const column = columnMap[action]
    if (!column) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Read current value then increment
    const { data: current, error: readError } = await supabase
      .from('tradable_products')
      .select(column)
      .eq('id', id)
      .single()

    if (readError || !current) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const { data: tradableProduct, error } = await supabase
      .from('tradable_products')
      .update({ [column]: (current[column] || 0) + 1 })
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
