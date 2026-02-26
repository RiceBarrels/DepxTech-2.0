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
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('commission_tiers')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch commission tiers' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tiers: data || [] })
  } catch (error) {
    console.error('Error in commission GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { brand, category, tiers } = await request.json()

    if (!Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json({ error: 'Tiers array is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('commission_tiers')
      .insert({
        brand: brand || null,
        category: category || null,
        tiers,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A tier config for this brand/category already exists' }, { status: 409 })
      }
      console.error('Error creating commission tier:', error)
      return NextResponse.json({ error: 'Failed to create commission tier' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tier: data })
  } catch (error) {
    console.error('Error in commission POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { id, tiers } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Tier ID is required' }, { status: 400 })
    }

    if (!Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json({ error: 'Tiers array is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('commission_tiers')
      .update({ tiers, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating commission tier:', error)
      return NextResponse.json({ error: 'Failed to update commission tier' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tier: data })
  } catch (error) {
    console.error('Error in commission PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Tier ID is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Prevent deleting the global default
    const { data: existing } = await supabase
      .from('commission_tiers')
      .select('brand, category')
      .eq('id', id)
      .single()

    if (existing && !existing.brand && !existing.category) {
      return NextResponse.json({ error: 'Cannot delete the global default tier' }, { status: 400 })
    }

    const { error } = await supabase
      .from('commission_tiers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting commission tier:', error)
      return NextResponse.json({ error: 'Failed to delete commission tier' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in commission DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
