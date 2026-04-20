'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { openWindow } from '@/components/ui/windows'
import AdminChatWindow from './AdminChatWindow'
import { subscribeToConversations } from '@/lib/chat'
import { supabase } from '@/lib/supabase'

export default function AdminChatButton() {
  const [unreadTotal, setUnreadTotal] = useState(0)
  const unsubRef = useRef(null)

  useEffect(() => {
    // Get initial unread count
    async function loadUnread() {
      try {
        const { data: convs } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('status', 'open')

        if (convs && convs.length > 0) {
          const convIds = convs.map((c) => c.id)
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', convIds)
            .eq('sender_type', 'customer')
            .eq('read', false)

          setUnreadTotal(count || 0)
        }
      } catch (err) {
        console.error('Failed to load unread count:', err)
      }
    }

    loadUnread()

    // Subscribe for live updates
    unsubRef.current = subscribeToConversations((eventType, newData) => {
      if (eventType === 'new_message' && newData.sender_type === 'customer') {
        setUnreadTotal((prev) => prev + 1)
      }
    })

    return () => {
      unsubRef.current?.()
    }
  }, [])

  function handleClick() {
    setUnreadTotal(0)
    openWindow('Customer Support', <AdminChatWindow />, {
      width: 700,
      height: 500,
      icon: <MessageCircle className="size-4" />,
    })
  }

  return (
    <button
      onClick={handleClick}
      className="relative size-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
      title="Customer Support"
    >
      <MessageCircle className="size-5 text-primary" />
      {unreadTotal > 0 && (
        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
          {unreadTotal > 9 ? '9+' : unreadTotal}
        </span>
      )}
    </button>
  )
}
