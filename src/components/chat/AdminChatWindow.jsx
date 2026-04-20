'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, X, User, Mail } from 'lucide-react'
import {
  getOpenConversations,
  getMessages,
  sendMessage,
  markAsRead,
  closeConversation,
  subscribeToConversations,
  subscribeToMessages,
} from '@/lib/chat'

function ConversationItem({ conv, isSelected, onClick, unreadCount }) {
  const t = useTranslations('chat')
  const name = conv.guest_name || conv.guest_email || t('guest')
  const time = conv.last_message_at
    ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-b transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-muted' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            {conv.guest_email && (
              <p className="text-xs text-muted-foreground truncate">{conv.guest_email}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 min-w-5 h-4 justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}

export default function AdminChatWindow() {
  const t = useTranslations('chat')
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState({})
  const messagesEndRef = useRef(null)
  const unsubConvRef = useRef(null)
  const unsubMsgRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load conversations
  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const convs = await getOpenConversations()
        if (mounted) setConversations(convs)
      } catch (err) {
        console.error('Failed to load conversations:', err)
      }
    }

    load()

    // Subscribe to conversation updates
    unsubConvRef.current = subscribeToConversations((eventType, newData, oldData) => {
      if (eventType === 'INSERT') {
        setConversations((prev) => [newData, ...prev])
      } else if (eventType === 'UPDATE') {
        setConversations((prev) =>
          prev
            .map((c) => (c.id === newData.id ? newData : c))
            .filter((c) => c.status === 'open')
        )
      } else if (eventType === 'new_message') {
        // Update unread counts for messages not in selected conversation
        const msg = newData
        if (msg.sender_type === 'customer') {
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
          }))
        }
        // Re-sort conversations
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === msg.conversation_id
              ? { ...c, last_message_at: msg.created_at }
              : c
          )
          return updated.sort(
            (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
          )
        })
      }
    })

    return () => {
      mounted = false
      unsubConvRef.current?.()
    }
  }, [])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    let mounted = true

    async function loadMessages() {
      try {
        const msgs = await getMessages(selectedId)
        if (mounted) {
          setMessages(msgs)
          await markAsRead(selectedId, 'agent')
          setUnreadCounts((prev) => ({ ...prev, [selectedId]: 0 }))
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
      }
    }

    loadMessages()

    // Subscribe to new messages for selected conversation
    unsubMsgRef.current?.()
    unsubMsgRef.current = subscribeToMessages(selectedId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      if (newMsg.sender_type === 'customer') {
        markAsRead(selectedId, 'agent').catch(() => {})
        setUnreadCounts((prev) => ({ ...prev, [selectedId]: 0 }))
      }
    })

    return () => {
      mounted = false
      unsubMsgRef.current?.()
    }
  }, [selectedId])

  // Auto-scroll
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !selectedId || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      await sendMessage({
        conversationId: selectedId,
        senderType: 'agent',
        senderId: user?.id || null,
        content,
      })
    } catch (err) {
      console.error('Failed to send:', err)
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  async function handleClose(convId) {
    try {
      await fetch(`/api/chat/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      })
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (selectedId === convId) {
        setSelectedId(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to close conversation:', err)
    }
  }

  const selectedConv = conversations.find((c) => c.id === selectedId)

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-56 border-r flex flex-col shrink-0">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold">{t('openChats')}</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 px-3">
              {t('noChats')}
            </p>
          )}
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isSelected={conv.id === selectedId}
              onClick={() => setSelectedId(conv.id)}
              unreadCount={unreadCounts[conv.id] || 0}
            />
          ))}
        </div>
      </div>

      {/* Message panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  {selectedConv.guest_name || selectedConv.guest_email || t('guest')}
                </span>
                {selectedConv.guest_email && (
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                    ({selectedConv.guest_email})
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive text-xs shrink-0"
                onClick={() => handleClose(selectedConv.id)}
              >
                <X className="size-3 mr-1" />
                {t('closeConversation')}
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => {
                const isAgent = msg.sender_type === 'agent'
                const showLabel = i === 0 || messages[i - 1]?.sender_type !== msg.sender_type
                const customerName = selectedConv.guest_name || selectedConv.guest_email || t('guest')
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    {msg.sender_type === 'system' ? (
                      <p className="text-xs text-muted-foreground text-center w-full py-1">
                        {msg.content}
                      </p>
                    ) : (
                      <>
                        {showLabel && (
                          <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
                            {isAgent ? t('you') : customerName}
                          </span>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                            isAgent
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t">
              <Input
                placeholder={t('typeMessage')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                autoFocus
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sending}
                className="size-9 shrink-0 rounded-full"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {t('noChats')}
          </div>
        )}
      </div>
    </div>
  )
}
