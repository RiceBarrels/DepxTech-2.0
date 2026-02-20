import { supabase } from '@/lib/supabase'

// --- Conversation helpers ---

export async function createConversation({ userId = null, guestName = null, guestEmail = null }) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: userId,
      guest_name: guestName,
      guest_email: guestEmail,
      status: 'open',
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConversation(conversationId) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (error) throw error
  return data
}

export async function getOpenConversations() {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('status', 'open')
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function closeConversation(conversationId) {
  const { error } = await supabase
    .from('chat_conversations')
    .update({ status: 'closed' })
    .eq('id', conversationId)

  if (error) throw error
}

// --- Message helpers ---

export async function sendMessage({ conversationId, senderType, senderId = null, content }) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_id: senderId,
      content,
    })
    .select()
    .single()

  if (error) throw error

  // Update last_message_at
  await supabase
    .from('chat_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function markAsRead(conversationId, readerType) {
  // If reader is customer, mark agent messages as read; vice versa
  const oppositeSenderType = readerType === 'customer' ? 'agent' : 'customer'

  const { error } = await supabase
    .from('chat_messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', oppositeSenderType)
    .eq('read', false)

  if (error) throw error
}

// --- Realtime subscriptions ---

export function subscribeToMessages(conversationId, onMessage) {
  const channel = supabase
    .channel(`chat-messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToConversationStatus(conversationId, onUpdate) {
  const channel = supabase
    .channel(`chat-conv-status-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${conversationId}`,
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToConversations(onUpdate) {
  const channel = supabase
    .channel('chat-conversations-all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_conversations',
      },
      (payload) => {
        onUpdate(payload.eventType, payload.new, payload.old)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        onUpdate('new_message', payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
