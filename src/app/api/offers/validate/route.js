import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { offerCode, cartTotal, cartItems } = body

    if (!offerCode) {
      return NextResponse.json(
        { error: 'Offer code is required' },
        { status: 400 }
      )
    }

    // Fetch offer by code
    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .eq('code', offerCode)
      .eq('is_active', true)
      .single()

    if (error || !offer) {
      return NextResponse.json(
        { error: 'Invalid or expired offer code' },
        { status: 404 }
      )
    }

    // Check if offer is currently active based on dates
    const now = new Date()
    const startDate = offer.start_date ? new Date(offer.start_date) : null
    const endDate = offer.end_date ? new Date(offer.end_date) : null
    
    if (startDate && now < startDate) {
      return NextResponse.json(
        { error: 'This offer has not started yet' },
        { status: 400 }
      )
    }
    
    if (endDate && now > endDate) {
      return NextResponse.json(
        { error: 'This offer has expired' },
        { status: 400 }
      )
    }

    // Check minimum purchase amount
    if (offer.min_purchase_amount && cartTotal < parseFloat(offer.min_purchase_amount)) {
      return NextResponse.json(
        { 
          error: `Minimum purchase amount of $${offer.min_purchase_amount} required`,
          minPurchase: parseFloat(offer.min_purchase_amount)
        },
        { status: 400 }
      )
    }

    // Check applicable categories if specified
    if (offer.applicable_categories && offer.applicable_categories.length > 0 && cartItems) {
      const cartCategories = new Set()
      cartItems.forEach(item => {
        if (item.category) {
          if (Array.isArray(item.category)) {
            item.category.forEach(cat => cartCategories.add(cat))
          } else {
            cartCategories.add(item.category)
          }
        }
      })
      
      const hasApplicableCategory = offer.applicable_categories.some(cat => 
        cartCategories.has(cat)
      )
      
      if (!hasApplicableCategory) {
        return NextResponse.json(
          { error: 'This offer is not applicable to items in your cart' },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discount = 0
    if (offer.discount_percentage !== null) {
      discount = (cartTotal * parseFloat(offer.discount_percentage)) / 100
      // Apply max discount limit if specified
      if (offer.max_discount_amount && discount > parseFloat(offer.max_discount_amount)) {
        discount = parseFloat(offer.max_discount_amount)
      }
    } else if (offer.discount_amount !== null) {
      discount = parseFloat(offer.discount_amount)
      // Don't exceed cart total
      if (discount > cartTotal) {
        discount = cartTotal
      }
    }

    return NextResponse.json({
      success: true,
      offer: offer,
      discount: discount,
      finalTotal: Math.max(0, cartTotal - discount)
    })

  } catch (error) {
    console.error('Error validating offer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
