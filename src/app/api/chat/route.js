import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, guestName, guestEmail } = body

    if (!userId && !guestName) {
      return NextResponse.json({ error: 'userId or guestName is required' }, { status: 400 })
    }

    // For logged-in users, fetch their profile name and email
    let displayName = guestName || null
    let displayEmail = guestEmail || null
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
      displayName = profile?.full_name || authUser?.user?.email || null
      displayEmail = authUser?.user?.email || null
    }

    const { data, error } = await supabaseAdmin
      .from('chat_conversations')
      .insert({
        user_id: userId || null,
        guest_name: displayName,
        guest_email: displayEmail,
        status: 'open',
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversation: data })
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
