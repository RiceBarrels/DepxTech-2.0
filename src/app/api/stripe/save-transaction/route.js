import { NextResponse } from 'next/server'
import { saveTransaction } from '@/lib/serverAuth'
import { createClient } from '@/utils/supabase/server'
import { notifyAdmins, buildOrderEmail } from '@/lib/email'
import { notifyAdminsPush } from '@/lib/notify'

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
      // Notify admins via email (fire-and-forget)
      notifyAdmins({
        subject: `New Order: $${(Number(amount) / 100).toFixed(2)}`,
        html: buildOrderEmail({
          amount,
          customerEmail: user.email,
          cartItems,
        }),
      })

      // Notify admins via push + inbox (fire-and-forget)
      notifyAdminsPush({
        type: 'admin_order',
        title: `New Order: $${(Number(amount) / 100).toFixed(2)}`,
        body: `Order from ${user.email}`,
        url: '/admin/orders',
      })

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