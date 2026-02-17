import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyAdmins, buildTradeInEmail } from '@/lib/email'

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

export async function PUT(request) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()

    const {
      quoteId,
      shippingMethod,
      // For admin email notification
      productTitle,
      customerName,
      customerEmail,
      customerPhone,
      estimatedValue,
      notes,
    } = body

    if (!quoteId || !shippingMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteId and shippingMethod' },
        { status: 400 }
      )
    }

    if (!['depxtech_box', 'own_box'].includes(shippingMethod)) {
      return NextResponse.json(
        { error: 'Invalid shipping method' },
        { status: 400 }
      )
    }

    // Update the quote with shipping method
    try {
      const { error } = await supabase
        .from('trade_quotes')
        .update({
          shipping_method: shippingMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)

      if (error) {
        // If column doesn't exist, log but don't fail
        if (error.code === '42703' || error.message?.includes('column')) {
          console.warn('shipping_method column may not exist yet:', error.message)
        } else {
          throw error
        }
      }
    } catch (err) {
      console.error('Error updating shipping method:', err)
    }

    // Notify admins via email (fire-and-forget)
    notifyAdmins({
      subject: `New Trade-in Quote: ${productTitle || 'Unknown Product'}`,
      html: buildTradeInEmail({
        productTitle: productTitle || 'Unknown Product',
        customerName: customerName || 'N/A',
        customerEmail: customerEmail || 'N/A',
        customerPhone,
        estimatedValue: estimatedValue || 0,
        notes,
        shippingMethod,
      }),
    })

    return NextResponse.json({
      success: true,
      message: 'Shipping method confirmed',
    })

  } catch (error) {
    console.error('Error confirming shipping method:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
