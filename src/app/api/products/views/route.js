import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get current views
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('views')
      .eq('id', productId)
      .single()

    if (fetchError) {
      console.error('Error fetching product:', fetchError)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Increment views
    const newViews = (product.views || 0) + 1
    
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ views: newViews })
      .eq('id', productId)
      .select('views')
      .single()

    if (updateError) {
      console.error('Error updating product views:', updateError)
      return NextResponse.json(
        { error: 'Failed to update product views' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      views: updateData.views 
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}