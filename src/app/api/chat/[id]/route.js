import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { notifyAdminsPush } from '@/lib/notify'

export async function GET(request, { params }) {
  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const { id } = await params

  try {
    const body = await request.json()
    const { senderType, senderId, content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (!senderType || !['customer', 'agent', 'system'].includes(senderType)) {
      return NextResponse.json({ error: 'Invalid sender type' }, { status: 400 })
    }

    // Insert message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id: id,
        sender_type: senderType,
        sender_id: senderId || null,
        content: content.trim(),
      })
      .select()
      .single()

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    // Update last_message_at
    await supabaseAdmin
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', id)

    // Notify admins when a customer sends a message (fire-and-forget)
    if (senderType === 'customer') {
      notifyAdminsPush({
        type: 'admin_chat',
        title: 'New Customer Support Message',
        body: content.trim().length > 80 ? content.trim().slice(0, 80) + '...' : content.trim(),
        url: `/admin/chat/${id}`,
      })
    }

    return NextResponse.json({ message })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params

  try {
    const body = await request.json()
    const updates = {}

    if (body.status) updates.status = body.status
    if (body.assigned_agent) updates.assigned_agent = body.assigned_agent

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('chat_conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If closing, send system message
    if (body.status === 'closed') {
      await supabaseAdmin
        .from('chat_messages')
        .insert({
          conversation_id: id,
          sender_type: 'system',
          content: 'Conversation closed',
        })
    }

    return NextResponse.json({ conversation: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
