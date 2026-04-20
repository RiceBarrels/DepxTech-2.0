import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildQuoteStatusEmail } from '@/lib/email'
import { notifyUser } from '@/lib/notify'


export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const supabase = supabaseAdmin

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

    const supabase = supabaseAdmin

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

    // Notify customer via all channels when status changes (fire-and-forget)
    if (status && data) {
      const statusLabels = { approved: 'Approved', rejected: 'Rejected', completed: 'Completed', pending: 'Pending' }
      const statusMessages = {
        approved: 'Your trade-in has been approved! Please ship your device.',
        rejected: 'Your trade-in was not approved. Contact us for questions.',
        completed: 'Your trade-in is complete! Payment is on the way.',
        pending: 'Your trade-in is being reviewed.',
      }
      const notifTitle = `Trade-in ${statusLabels[status] || status}: ${data.product_title}`
      const notifBody = statusMessages[status] || `Your trade-in status changed to ${status}.`

      notifyUser({
        userId: data.user_id,
        email: data.customer_email,
        type: 'trade_status',
        title: notifTitle,
        body: notifBody,
        data: {
          quote_id: data.id,
          product_title: data.product_title,
          status,
          estimated_value: data.estimated_value,
        },
        emailSubject: `Trade-in Quote ${statusLabels[status] || status}: ${data.product_title}`,
        emailHtml: buildQuoteStatusEmail({
          productTitle: data.product_title,
          customerName: data.customer_name,
          estimatedValue: data.estimated_value,
          status,
        }),
        pushUrl: '/account/inbox',
      })
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

    const supabase = supabaseAdmin

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
