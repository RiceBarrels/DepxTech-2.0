import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for admin operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(request) {
  try {
    // Verify admin access - now creates its own server client
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // If user is admin, return success with role information
    return NextResponse.json({
      success: true,
      message: 'Admin access confirmed',
      userRole: 'admin',
      userId: adminVerification.userId,
      profileData: adminVerification.profileData
    })

  } catch (error) {
    console.error('Error in admin products edit GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Verify admin access - now creates its own server client
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // Get request body for product editing
    const body = await request.json()
    console.log('Product edit request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Product ID is required' }, 
        { status: 400 }
      )
    }

    // Extract product data from request body
    const {
      id,
      title,
      des,
      imgs,
      price,
      category,
      stocks,
      variant_of_id,
      variant_data,
      views
    } = body

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Prepare update data (only include fields that are provided)
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (des !== undefined) updateData.des = des
    if (imgs !== undefined) updateData.imgs = imgs
    if (price !== undefined) updateData.price = price
    if (category !== undefined) updateData.category = category
    if (stocks !== undefined) updateData.stocks = stocks
    if (variant_of_id !== undefined) {
      // Handle UUID field - set to null if empty string
      updateData.variant_of_id = variant_of_id === '' ? null : variant_of_id
    }
    if (variant_data !== undefined) updateData.variant_data = variant_data
    if (views !== undefined) updateData.views = views

    // Update the product in the database
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin products edit POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
