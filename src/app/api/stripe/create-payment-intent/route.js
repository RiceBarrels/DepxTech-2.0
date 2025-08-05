import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function POST(request) {
  try {
    const { amount, currency, cartItems, billingDetails } = await request.json()

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid user' },
        { status: 401 }
      )
    }

    // Validate the amount
    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency || 'usd',
      metadata: {
        userId: user.id,
        userEmail: user.email,
        cartItems: JSON.stringify(cartItems),
        billingDetails: JSON.stringify(billingDetails),
      },
    })

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 