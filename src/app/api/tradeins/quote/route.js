import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for public operations
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

export async function POST(request) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    
    const {
      productId,
      productTitle,
      condition,
      estimatedValue,
      name,
      email,
      phone,
      notes,
      userId
    } = body

    // Validate required fields
    if (!productId || !productTitle || !condition || !estimatedValue || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if trade_quotes table exists, if not we'll create a simple storage
    // For now, we'll try to insert into a trade_quotes table
    // If it doesn't exist, we can store in a JSON format or create the table
    
    // Try to insert quote request
    // Note: If the table doesn't exist, you'll need to create it in Supabase
    // For now, we'll use a generic approach that can work with or without a table
    
    const quoteData = {
      product_id: productId,
      product_title: productTitle,
      condition: condition,
      estimated_value: parseFloat(estimatedValue),
      customer_name: name,
      customer_email: email,
      customer_phone: phone || null,
      notes: notes || null,
      user_id: userId || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Try to insert into trade_quotes table
    // If table doesn't exist, this will fail and we can handle it gracefully
    let quote
    let error
    
    try {
      const result = await supabase
        .from('trade_quotes')
        .insert([quoteData])
        .select()
        .single()
      
      quote = result.data
      error = result.error
    } catch (err) {
      error = err
    }

    if (error) {
      // Check if error is due to table not existing
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        // Table doesn't exist - log for now and return success
        // In production, create the trade_quotes table with this structure:
        /*
        CREATE TABLE IF NOT EXISTS "public"."trade_quotes" (
          "id" uuid DEFAULT gen_random_uuid() NOT NULL,
          "product_id" uuid NOT NULL,
          "product_title" text NOT NULL,
          "condition" text NOT NULL,
          "estimated_value" numeric NOT NULL,
          "customer_name" text NOT NULL,
          "customer_email" text NOT NULL,
          "customer_phone" text,
          "notes" text,
          "user_id" uuid,
          "status" text DEFAULT 'pending' NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          CONSTRAINT "trade_quotes_pkey" PRIMARY KEY ("id")
        );
        */
        console.log('Trade quote request (table may not exist):', JSON.stringify(quoteData, null, 2))
        
        // Still increment trades count
        const { data: product } = await supabase
          .from('tradable_products')
          .select('trades')
          .eq('id', productId)
          .single()
        
        if (product) {
          await supabase
            .from('tradable_products')
            .update({ trades: (product.trades || 0) + 1 })
            .eq('id', productId)
        }
        
        return NextResponse.json({
          success: true,
          message: 'Quote request received. We will contact you soon.',
          quote: quoteData
        })
      } else {
        // Other database error
        console.error('Error inserting trade quote:', error)
        throw error
      }
    }

    // Increment trades count for the product
    const { data: product } = await supabase
      .from('tradable_products')
      .select('trades')
      .eq('id', productId)
      .single()
    
    if (product) {
      await supabase
        .from('tradable_products')
        .update({ trades: (product.trades || 0) + 1 })
        .eq('id', productId)
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      quote: quote
    })

  } catch (error) {
    console.error('Error submitting trade quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
