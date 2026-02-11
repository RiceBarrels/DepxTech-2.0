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

export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const supabase = createServiceRoleClient()

    const { data: quotes, error } = await supabase
      .from('trade_quotes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trade quotes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trade quotes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quotes: quotes || [],
      userId: adminVerification.userId
    })
  } catch (error) {
    console.error('Error in admin trade-quotes GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const body = await request.json()

    if (!body.quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const { quoteId, status, notes, estimated_value } = body

    const supabase = createServiceRoleClient()

    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (estimated_value !== undefined) updateData.estimated_value = estimated_value

    const { data, error } = await supabase
      .from('trade_quotes')
      .update(updateData)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating trade quote:', error)
      return NextResponse.json(
        { error: 'Failed to update trade quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quote: data,
      userId: adminVerification.userId
    })
  } catch (error) {
    console.error('Error in admin trade-quotes PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const quoteId = searchParams.get('id')

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('trade_quotes')
      .delete()
      .eq('id', quoteId)

    if (error) {
      console.error('Error deleting trade quote:', error)
      return NextResponse.json(
        { error: 'Failed to delete trade quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trade quote deleted successfully',
      userId: adminVerification.userId
    })
  } catch (error) {
    console.error('Error in admin trade-quotes DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
