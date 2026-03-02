import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPushToUser } from '@/lib/push'


// GET: List all admin push notifications
export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const supabase = supabaseAdmin

    const { data, error } = await supabase
      .from('admin_push_notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin push notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ success: true, notifications: data || [] })
  } catch (error) {
    console.error('Error in admin push-notifications GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Send a new push notification to all users
export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const body = await request.json()
    const { title, body: notifBody, url } = body

    if (!title || !notifBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    const supabase = supabaseAdmin

    // 1) Get all users with push subscriptions
    const { data: allUsers, error: usersError } = await supabase
      .from('push_subscriptions')
      .select('user_id')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Deduplicate user IDs
    const userIds = [...new Set((allUsers || []).map((u) => u.user_id))]

    // 2) Insert into admin_push_notifications log
    const { data: notifRecord, error: insertError } = await supabase
      .from('admin_push_notifications')
      .insert({
        title,
        body: notifBody,
        url: url || null,
        target: 'all',
        sent_by: adminVerification.userId,
        sent_count: userIds.length,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting admin push notification:', insertError)
      return NextResponse.json({ error: 'Failed to save notification' }, { status: 500 })
    }

    // 3) Insert in-app notifications for each user + send web push (fire-and-forget)
    for (const userId of userIds) {
      // In-app notification
      supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'admin_push',
          title,
          body: notifBody,
          url: url || null,
          data: { admin_notification_id: notifRecord.id, url: url || null },
        })
        .then(({ error }) => {
          if (error) console.error('[AdminPush] Insert notification error:', error)
        })

      // Web push
      sendPushToUser({
        userId,
        title,
        body: notifBody,
        url: url || '/account/inbox',
        tag: `admin-push-${notifRecord.id}`,
      })
    }

    return NextResponse.json({
      success: true,
      notification: notifRecord,
      sentTo: userIds.length,
    })
  } catch (error) {
    console.error('Error in admin push-notifications POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Delete a notification record
export async function DELETE(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const supabase = supabaseAdmin

    const { error } = await supabase
      .from('admin_push_notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting admin push notification:', error)
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin push-notifications DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
