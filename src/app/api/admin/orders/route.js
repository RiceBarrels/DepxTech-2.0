import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
    const supabase = supabaseAdmin

    // Fetch all transactions from the database
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin orders GET route:', error)
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

    // Get request body for transaction update
    const body = await request.json()
    console.log('Transaction update request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' }, 
        { status: 400 }
      )
    }

    // Extract update data from request body
    const { transactionId, status, orderStatus } = body

    // Create service role client for admin operations
    const supabase = supabaseAdmin

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    if (orderStatus) {
      updateData.order_status = orderStatus
    }

    // Update the transaction in the database
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating transaction:', error)
      return NextResponse.json(
        { error: 'Failed to update transaction' }, 
        { status: 500 }
      )
    }

    // If the order is completed, we might want to update the customer profile too
    if (orderStatus === 'completed' && data) {
      try {
        // Fetch current customer profile
        const { data: customerProfile, error: profileError } = await supabase
          .from('profile_customer_readonly')
          .select('transactions')
          .eq('id', data.user_id)
          .single()

        if (!profileError && customerProfile) {
          // Update customer transactions array
          let currentTransactions = []
          if (customerProfile.transactions) {
            try {
              currentTransactions = JSON.parse(customerProfile.transactions)
            } catch (parseError) {
              console.warn('Error parsing customer transactions')
              currentTransactions = []
            }
          }

          // Check if this transaction is already in the customer's transactions
          const existingTransactionIndex = currentTransactions.findIndex(t => t.id === transactionId)
          
          if (existingTransactionIndex >= 0) {
            // Update existing transaction
            currentTransactions[existingTransactionIndex] = {
              id: data.id,
              payment_intent_id: data.payment_intent_id,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              order_status: data.order_status,
              created_at: data.created_at,
              updated_at: data.updated_at
            }
          } else {
            // Add new transaction
            currentTransactions.push({
              id: data.id,
              payment_intent_id: data.payment_intent_id,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              order_status: data.order_status,
              created_at: data.created_at,
              updated_at: data.updated_at
            })
          }

          // Update customer profile
          const { error: updateProfileError } = await supabase
            .from('profile_customer_readonly')
            .update({ transactions: JSON.stringify(currentTransactions) })
            .eq('id', data.user_id)

          if (updateProfileError) {
            console.error('Error updating customer profile transactions:', updateProfileError)
            // Don't fail the main request for this
          }
        }
      } catch (profileUpdateError) {
        console.error('Error updating customer profile:', profileUpdateError)
        // Don't fail the main request for this
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin orders PUT route:', error)
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

    // Get request body for manual transaction creation
    const body = await request.json()
    console.log('Manual transaction creation request from admin:', adminVerification.userId, body)

    // Validate required fields
    if (!body.user_id || !body.amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' }, 
        { status: 400 }
      )
    }

    // Extract transaction data from request body
    const {
      user_id,
      payment_intent_id,
      amount,
      currency,
      status,
      cart_items,
      billing_details,
      shipping_details,
      order_status
    } = body

    // Create service role client for admin operations
    const supabase = supabaseAdmin

    // Prepare insert data
    const insertData = {
      user_id,
      payment_intent_id: payment_intent_id || `manual_${Date.now()}`,
      amount,
      currency: currency || 'USD',
      status: status || 'succeeded',
      cart_items: cart_items || [],
      billing_details: billing_details || {},
      shipping_details: shipping_details || {},
      order_status: order_status || 'pending'
    }

    // Insert the new transaction into the database
    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json(
        { error: 'Failed to create transaction' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      transaction: data,
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin orders POST route:', error)
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

    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('id')

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' }, 
        { status: 400 }
      )
    }

    // Create service role client for admin operations
    const supabase = supabaseAdmin

    // Delete the transaction from the database
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) {
      console.error('Error deleting transaction:', error)
      return NextResponse.json(
        { error: 'Failed to delete transaction' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      userRole: 'admin',
      userId: adminVerification.userId
    })

  } catch (error) {
    console.error('Error in admin orders DELETE route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 