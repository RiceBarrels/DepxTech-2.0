import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')
  const active = searchParams.get('active')

  try {
    let query = supabase
      .from('trade_categories')
      .select('*')
      .order('display_order', { ascending: true })

    // Filter by featured status
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    // Filter by active status (default to active only)
    if (active !== 'false') {
      query = query.eq('is_active', true)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Error fetching trade categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trade categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ categories }, { status: 200 })
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
      name,
      slug,
      description,
      icon = 'Package',
      is_popular = false,
      is_featured = false,
      featured_image,
      display_order = 0,
      is_active = true
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const { data: category, error } = await supabase
      .from('trade_categories')
      .insert([{
        name,
        slug,
        description,
        icon,
        is_popular,
        is_featured,
        featured_image,
        display_order,
        is_active
      }])
      .select()

    if (error) {
      console.error('Error creating trade category:', error)
      return NextResponse.json(
        { error: 'Failed to create trade category' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { category: category[0] },
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
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data: category, error } = await supabase
      .from('trade_categories')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating trade category:', error)
      return NextResponse.json(
        { error: 'Failed to update trade category' },
        { status: 500 }
      )
    }

    if (!category || category.length === 0) {
      return NextResponse.json(
        { error: 'Trade category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { category: category[0] },
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
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('trade_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting trade category:', error)
      return NextResponse.json(
        { error: 'Failed to delete trade category' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Trade category deleted successfully' },
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
