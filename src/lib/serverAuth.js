import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create Supabase client with service role for administrative operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Server-side admin role checking function for API routes
export async function checkServerAdminRole(supabaseClient, userId) {
  try {
    console.log('Server-side admin check for user ID:', userId)
    
    if (!userId) {
      return { isAdmin: false, error: 'No user ID provided' }
    }

    // Fetch user's profile data from readonly table
    const { data: profileData, error } = await supabaseClient
      .from('profile_customer_readonly')
      .select('*')
      .eq('id', userId)

    if (error) {
      console.error('Error fetching profile data for admin check:', error)
      return { isAdmin: false, error: error.message }
    }

    console.log('Server admin check - Profile data:', profileData)

    // Check if user has admin role
    const hasAdminRole = profileData && profileData.some(
      profile => profile.role === 'admin'
    )

    console.log('Server admin check - Has admin role:', hasAdminRole)

    return { 
      isAdmin: hasAdminRole, 
      profileData: profileData || [],
      error: null 
    }
  } catch (error) {
    console.error('Error in server-side admin role check:', error)
    return { isAdmin: false, error: error.message }
  }
}

// Server-side function to verify admin access with session
export async function verifyAdminAccess(request = null) {
  try {
    console.log('=== Starting admin access verification ===')
    
    // Create Supabase client with proper cookie handling
    const supabase = await createClient()
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('Session details:', {
      hasSession: !!session,
      sessionError: sessionError,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      expiresAt: session?.expires_at
    })
    
    if (sessionError || !session) {
      console.log('No valid session found')
      return { 
        authorized: false, 
        isAdmin: false, 
        error: 'Unauthorized - No valid session',
        status: 401
      }
    }

    const userId = session.user.id
    console.log('Verifying admin access for user:', userId)

    // Check if user has admin role
    const adminCheck = await checkServerAdminRole(supabase, userId)
    
    if (adminCheck.error) {
      return { 
        authorized: false, 
        isAdmin: false, 
        error: `Admin check failed: ${adminCheck.error}`,
        status: 500,
        userId
      }
    }

    if (!adminCheck.isAdmin) {
      return { 
        authorized: false, 
        isAdmin: false, 
        error: 'Forbidden - Admin role required',
        status: 403,
        userId
      }
    }

    // Return success with user and role info
    return {
      authorized: true,
      isAdmin: true,
      user: session.user,
      userId: userId,
      profileData: adminCheck.profileData,
      error: null,
      status: 200
    }

  } catch (error) {
    console.error('Error in verifyAdminAccess:', error)
    return { 
      authorized: false, 
      isAdmin: false, 
      error: 'Internal server error during admin verification',
      status: 500
    }
  }
}

// Save transaction to database
export async function saveTransaction(userId, paymentIntentId, amount, cartItems, billingDetails, status) {
  try {
    console.log('Saving transaction for user:', userId)
    console.log('Payment intent ID:', paymentIntentId, 'Type:', typeof paymentIntentId)
    
    const supabase = createServiceRoleClient()
    
    // Create transaction object
    const transaction = {
      user_id: userId,
      payment_intent_id: paymentIntentId.toString(), // Ensure it's a string
      amount: amount,
      currency: 'usd',
      status: status,
      cart_items: JSON.stringify(cartItems), // Ensure cart items are JSON string
      billing_details: JSON.stringify(billingDetails), // Ensure billing details are JSON string
      updated_at: new Date().toISOString()
    }

    console.log('Transaction object to insert:', transaction)

    // Insert transaction directly into transactions table
    const { data: insertedTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting transaction:', insertError)
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      return { success: false, error: insertError.message }
    }

    console.log('Transaction saved successfully:', insertedTransaction.id)
    return { 
      success: true, 
      transaction: insertedTransaction 
    }

  } catch (error) {
    console.error('Error saving transaction:', error)
    return { success: false, error: error.message }
  }
}

// Get user transactions
export async function getUserTransactions(userId) {
  try {
    console.log('Fetching transactions for user:', userId)
    
    const supabase = await createClient()
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user transactions:', error)
      return { success: false, error: error.message, transactions: [] }
    }

    return { 
      success: true, 
      transactions: transactions || [] 
    }

  } catch (error) {
    console.error('Error in getUserTransactions:', error)
    return { success: false, error: error.message, transactions: [] }
  }
} 