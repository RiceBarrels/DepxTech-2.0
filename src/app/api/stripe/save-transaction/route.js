import { NextResponse } from 'next/server'
import { saveTransaction } from '@/lib/serverAuth'
import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
  try {
    const { paymentIntentId, amount, cartItems, billingDetails, status } = await request.json()

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid user' },
        { status: 401 }
      )
    }

    // Save transaction to database
    const transactionResult = await saveTransaction(
      user.id,
      paymentIntentId,
      amount,
      cartItems,
      billingDetails,
      status
    )

    if (transactionResult.success) {
      return NextResponse.json({
        success: true,
        transaction: transactionResult.transaction
      })
    } else {
      return NextResponse.json(
        { error: transactionResult.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error saving transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 