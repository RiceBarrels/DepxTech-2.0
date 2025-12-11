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
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Fetch specific offer
      const { data: offer, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching offer:', error)
        return NextResponse.json(
          { error: 'Failed to fetch offer' }, 
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        offer: offer,
        userRole: 'admin',
        userId: adminVerification.userId
      })
    } else {
      // Fetch all offers
      const { data: offers, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching offers:', error)
        return NextResponse.json(
          { error: 'Failed to fetch offers' }, 
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        offers: offers || [],
        userRole: 'admin',
        userId: adminVerification.userId
      })
    }

  } catch (error) {
    console.error('Error in admin offers GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // Get request body for offer creation
    const body = await request.json()
    console.log('Offer creation request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Offer title is required' }, 
        { status: 400 }
      )
    }

    if (!body.description) {
      return NextResponse.json(
        { error: 'Offer description is required' }, 
        { status: 400 }
      )
    }

    if (body.discount_percentage === undefined && body.discount_amount === undefined) {
      return NextResponse.json(
        { error: 'Either discount percentage or discount amount is required' }, 
        { status: 400 }
      )
    }

    if (body.discount_percentage !== undefined && (body.discount_percentage < 0 || body.discount_percentage > 100)) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 100' }, 
        { status: 400 }
      )
    }

    if (body.discount_amount !== undefined && body.discount_amount < 0) {
      return NextResponse.json(
        { error: 'Discount amount must be positive' }, 
        { status: 400 }
      )
    }

    // Extract offer data from request body
    const {
      title,
      description,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      is_active,
      image_url,
      code,
      min_purchase_amount,
      max_discount_amount,
      applicable_categories
    } = body

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Prepare insert data
    const insertData = {
      title,
      description: description || '',
      discount_percentage: discount_percentage !== undefined ? discount_percentage : null,
      discount_amount: discount_amount !== undefined ? discount_amount : null,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: is_active !== undefined ? is_active : true,
      image_url: image_url || null,
      code: code || null,
      min_purchase_amount: min_purchase_amount || null,
      max_discount_amount: max_discount_amount || null,
      applicable_categories: applicable_categories || []
    }

    // Insert the new offer into the database
    const { data, error } = await supabase
      .from('offers')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating offer:', error)
      return NextResponse.json(
        { error: 'Failed to create offer' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Offer created successfully',
      offer: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin offers POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // Get request body for offer update
    const body = await request.json()
    console.log('Offer update request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Offer ID is required for update' }, 
        { status: 400 }
      )
    }

    if (!body.title) {
      return NextResponse.json(
        { error: 'Offer title is required' }, 
        { status: 400 }
      )
    }

    if (body.discount_percentage !== undefined && (body.discount_percentage < 0 || body.discount_percentage > 100)) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 100' }, 
        { status: 400 }
      )
    }

    if (body.discount_amount !== undefined && body.discount_amount < 0) {
      return NextResponse.json(
        { error: 'Discount amount must be positive' }, 
        { status: 400 }
      )
    }

    // Extract offer data from request body
    const {
      id,
      title,
      description,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      is_active,
      image_url,
      code,
      min_purchase_amount,
      max_discount_amount,
      applicable_categories
    } = body

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Prepare update data
    const updateData = {
      title,
      description: description || '',
      discount_percentage: discount_percentage !== undefined ? discount_percentage : null,
      discount_amount: discount_amount !== undefined ? discount_amount : null,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: is_active !== undefined ? is_active : true,
      image_url: image_url || null,
      code: code || null,
      min_purchase_amount: min_purchase_amount || null,
      max_discount_amount: max_discount_amount || null,
      applicable_categories: applicable_categories || []
    }

    // Update the offer in the database
    const { data, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating offer:', error)
      return NextResponse.json(
        { error: 'Failed to update offer' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Offer updated successfully',
      offer: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin offers PUT route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    // Get offer ID from query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID is required for deletion' }, 
        { status: 400 }
      )
    }

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Delete the offer from the database
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting offer:', error)
      return NextResponse.json(
        { error: 'Failed to delete offer' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully',
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin offers DELETE route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
