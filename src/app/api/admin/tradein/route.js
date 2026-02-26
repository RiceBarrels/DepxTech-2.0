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
      // Fetch specific tradable product
      const { data: product, error } = await supabase
        .from('tradable_products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching tradable product:', error)
        return NextResponse.json(
          { error: 'Failed to fetch tradable product' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        product: product,
        userRole: 'admin',
        userId: adminVerification.userId
      })
    } else {
      // Fetch all tradable products
      const { data: products, error } = await supabase
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

      return NextResponse.json({
        success: true,
        products: products || [],
        userRole: 'admin',
        userId: adminVerification.userId
      })
    }

  } catch (error) {
    console.error('Error in admin tradein GET route:', error)
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

    // Get request body for tradable product creation
    const body = await request.json()
    console.log('Tradable product creation request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Product title is required' },
        { status: 400 }
      )
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    if (!body.brand) {
      return NextResponse.json(
        { error: 'Brand is required' },
        { status: 400 }
      )
    }

    if (!body.series) {
      return NextResponse.json(
        { error: 'Series is required' },
        { status: 400 }
      )
    }

    if (!body.base_price || body.base_price < 0) {
      return NextResponse.json(
        { error: 'Valid base price is required' },
        { status: 400 }
      )
    }

    // Extract tradable product data from request body
    const {
      title,
      des,
      base_price,
      category,
      brand,
      series,
      imgs,
      base_date,
      depreciation_rate,
      is_featured,
      questions,
      question_template_id
    } = body

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Prepare insert data with new schema
    const insertData = {
      title,
      des: des || '',
      base_price: parseFloat(base_price) || 0,
      category,
      brand,
      series,
      imgs: imgs || [],
      base_date: base_date || null,
      depreciation_rate: parseFloat(depreciation_rate) || 0,
      is_featured: is_featured || false,
      questions: questions || [],
      question_template_id: question_template_id || null,
      title_i18n: body.title_i18n || {},
      des_i18n: body.des_i18n || {},
      questions_i18n: body.questions_i18n || {},
      trades: 0,
      views: 0,
      likes: 0
    }

    // Insert the new tradable product into the database
    const { data, error } = await supabase
      .from('tradable_products')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tradable product:', error)
      return NextResponse.json(
        { error: 'Failed to create tradable product: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tradable product created successfully',
      product: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin tradein POST route:', error)
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

    // Get request body for tradable product update
    const body = await request.json()
    console.log('Tradable product update request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Product ID is required for update' },
        { status: 400 }
      )
    }

    if (!body.title) {
      return NextResponse.json(
        { error: 'Product title is required' },
        { status: 400 }
      )
    }

    // Extract tradable product data from request body
    const {
      id,
      title,
      des,
      base_price,
      category,
      brand,
      series,
      imgs,
      base_date,
      depreciation_rate,
      is_featured,
      questions,
      question_template_id
    } = body

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Prepare update data with new schema
    const updateData = {
      title,
      des: des || '',
      base_price: parseFloat(base_price) || 0,
      category: category || '',
      brand: brand || '',
      series: series || '',
      imgs: imgs || [],
      base_date: base_date || null,
      depreciation_rate: parseFloat(depreciation_rate) || 0,
      is_featured: is_featured || false,
      questions: questions || [],
      title_i18n: body.title_i18n || {},
      des_i18n: body.des_i18n || {},
      questions_i18n: body.questions_i18n || {},
    }

    // Only update question_template_id if explicitly provided
    if (body.question_template_id !== undefined) {
      updateData.question_template_id = body.question_template_id
    }

    // Update the tradable product in the database
    const { data, error } = await supabase
      .from('tradable_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tradable product:', error)
      return NextResponse.json(
        { error: 'Failed to update tradable product: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tradable product updated successfully',
      product: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin tradein PUT route:', error)
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

    // Get product ID from query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required for deletion' },
        { status: 400 }
      )
    }

    // Create service role client for admin operations
    const supabase = createServiceRoleClient()

    // Delete the tradable product from the database
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

    return NextResponse.json({
      success: true,
      message: 'Tradable product deleted successfully',
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin tradein DELETE route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
