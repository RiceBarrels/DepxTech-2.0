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
    console.error('Error in admin products add GET route:', error)
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

    // Get request body for product creation
    const body = await request.json()
    console.log('Product creation request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Product title is required' }, 
        { status: 400 }
      )
    }

    if (!body.price || body.price < 0) {
      return NextResponse.json(
        { error: 'Valid price is required' }, 
        { status: 400 }
      )
    }

    if (!body.stocks || body.stocks < 0) {
      return NextResponse.json(
        { error: 'Valid stock quantity is required' }, 
        { status: 400 }
      )
    }

    // Extract product data from request body
    const {
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

    // Prepare insert data
    const insertData = {
      title,
      des: des || '',
      imgs: imgs || [],
      price,
      category: category || [],
      stocks,
      variant_of_id: variant_of_id === '' ? null : variant_of_id,
      variant_data: variant_data || [{ variant_type: '', variant_title: '' }],
      views: views || 0
    }

    // Insert the new product into the database
    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin products add POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
