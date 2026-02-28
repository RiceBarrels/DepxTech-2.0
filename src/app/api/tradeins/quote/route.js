import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyAdminsPush } from '@/lib/notify'

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
      // New questionnaire fields
      answers,
      accessories,
      totalDeduction,
      totalBonus,
      basePrice,
      depreciation,
      // Legacy field (for backwards compatibility)
      condition,
      // Common fields
      estimatedValue,
      name,
      email,
      phone,
      notes,
      userId
    } = body

    // Validate required fields
    if (!productId || !productTitle || !estimatedValue || !name || !email) {
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

    // Build quote data - supports both legacy and new questionnaire format
    const quoteData = {
      product_id: productId,
      product_title: productTitle,
      estimated_value: parseFloat(estimatedValue),
      customer_name: name,
      customer_email: email,
      customer_phone: phone || null,
      notes: notes || null,
      user_id: userId || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      // New questionnaire fields (stored as JSONB)
      answers: answers || null,
      accessories: accessories || null,
      total_deduction: totalDeduction || 0,
      total_bonus: totalBonus || 0,
      base_price: basePrice || null,
      depreciation: depreciation || null,
      // Legacy field
      condition: condition || null
    }

    // Try to insert into trade_quotes table
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
      } else if (error.code === '42703' || error.message?.includes('column')) {
        // Column doesn't exist - try with minimal fields
        const minimalQuoteData = {
          product_id: productId,
          product_title: productTitle,
          condition: condition || JSON.stringify({ answers, accessories, totalDeduction, totalBonus }),
          estimated_value: parseFloat(estimatedValue),
          customer_name: name,
          customer_email: email,
          customer_phone: phone || null,
          notes: notes || null,
          user_id: userId || null,
          status: 'pending',
          created_at: new Date().toISOString()
        }

        const retryResult = await supabase
          .from('trade_quotes')
          .insert([minimalQuoteData])
          .select()
          .single()

        if (retryResult.error) {
          console.error('Error inserting trade quote (retry):', retryResult.error)
          throw retryResult.error
        }

        quote = retryResult.data
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

    // Notify admins via push + inbox (fire-and-forget)
    notifyAdminsPush({
      type: 'admin_trade_in',
      title: `New Trade-in: ${productTitle}`,
      body: `${name} submitted a trade-in worth $${Number(estimatedValue).toFixed(2)}`,
      url: '/admin/trade-quotes',
    })

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      quote: quote || quoteData
    })

  } catch (error) {
    console.error('Error submitting trade quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
