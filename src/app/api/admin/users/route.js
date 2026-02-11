import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
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

// GET — List all users with profile data
export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const supabase = createServiceRoleClient()

    // Fetch all auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    })

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const authUsers = authData?.users || []

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Fetch all customer readonly data
    const { data: customerData, error: customerError } = await supabase
      .from('profile_customer_readonly')
      .select('id, role, plan, "plan-cycle", "plan-start-date", "plan-end-date"')

    if (customerError) {
      console.error('Error fetching customer data:', customerError)
    }

    // Create lookup maps
    const profileMap = {}
    ;(profiles || []).forEach(p => { profileMap[p.id] = p })

    const customerMap = {}
    ;(customerData || []).forEach(c => { customerMap[c.id] = c })

    // Merge data
    const users = authUsers.map(authUser => {
      const profile = profileMap[authUser.id] || {}
      const customer = customerMap[authUser.id] || {}

      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile.full_name || null,
        avatar: profile.avatar || 'default',
        role: customer.role || 'customer',
        plan: customer.plan || null,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
      }
    })

    return NextResponse.json({
      success: true,
      users,
      currentUserId: adminVerification.userId,
    })
  } catch (error) {
    console.error('Error in admin users GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — Update user role
export async function PUT(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
    }

    if (!['admin', 'customer'].includes(role)) {
      return NextResponse.json({ error: 'Role must be "admin" or "customer"' }, { status: 400 })
    }

    // Prevent self-demotion
    if (userId === adminVerification.userId && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    // Check if row exists in profile_customer_readonly
    const { data: existing, error: checkError } = await supabase
      .from('profile_customer_readonly')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = row not found, which is OK — we'll insert
      console.error('Error checking user role:', checkError)
      return NextResponse.json({ error: 'Failed to check user role' }, { status: 500 })
    }

    let result
    if (existing) {
      // Update existing
      result = await supabase
        .from('profile_customer_readonly')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()
    } else {
      // Insert new
      result = await supabase
        .from('profile_customer_readonly')
        .insert({ id: userId, role })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error updating user role:', result.error)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: result.data,
    })
  } catch (error) {
    console.error('Error in admin users PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Delete user account
export async function DELETE(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === adminVerification.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    // Delete from profile tables first (in case FK cascade doesn't cover it)
    await supabase.from('profile_customer_readonly').delete().eq('id', userId)
    await supabase.from('profiles').delete().eq('id', userId)

    // Delete auth user (this may also cascade to profiles)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error in admin users DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
