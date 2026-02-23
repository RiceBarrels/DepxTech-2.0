'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, X, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  sendMessage,
  getMessages,
  markAsRead,
  subscribeToMessages,
  subscribeToConversationStatus,
} from '@/lib/chat'
import { TopSafeArea } from '../safe-area'

const SESSION_KEY = 'depxtech-chat-session'

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}

export function ChatWidget({ onClose }) {
  const t = useTranslations('chat')
  const { user } = useAuth()
  const [phase, setPhase] = useState('loading') // loading | form | chatting
  const [conversationId, setConversationId] = useState(null)
  const [conversationStatus, setConversationStatus] = useState('open')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const messagesEndRef = useRef(null)
  const unsubMsgRef = useRef(null)
  const unsubStatusRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Initialize: check for existing session
  useEffect(() => {
    const session = getSession()
    if (session?.conversationId) {
      setConversationId(session.conversationId)
      setPhase('chatting')
    } else if (user) {
      // Logged-in user: skip form, but wait for first message to create conversation
      setPhase('chatting')
    } else {
      setPhase('form')
    }
  }, [user])

  // Load messages and subscribe when conversation is set
  useEffect(() => {
    if (!conversationId) return

    let mounted = true

    async function loadMessages() {
      try {
        const msgs = await getMessages(conversationId)
        if (mounted) {
          setMessages(msgs)
          await markAsRead(conversationId, 'customer')
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
      }
    }

    loadMessages()

    // Subscribe to new messages
    unsubMsgRef.current = subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      // Mark agent messages as read
      if (newMsg.sender_type === 'agent') {
        markAsRead(conversationId, 'customer').catch(() => {})
      }
    })

    // Subscribe to conversation status changes
    unsubStatusRef.current = subscribeToConversationStatus(conversationId, (conv) => {
      setConversationStatus(conv.status)
    })

    return () => {
      mounted = false
      unsubMsgRef.current?.()
      unsubStatusRef.current?.()
    }
  }, [conversationId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  async function createNewConversation(name, email) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          guestName: user ? null : name,
          guestEmail: user ? null : email || null,
        }),
      })
      const data = await res.json()
      if (data.conversation) {
        setConversationId(data.conversation.id)
        setSession({ conversationId: data.conversation.id })
        setConversationStatus('open')
        return data.conversation.id
      }
    } catch (err) {
      console.error('Failed to create conversation:', err)
    }
    return null
  }

  async function handleGuestSubmit(e) {
    e.preventDefault()
    if (!guestName.trim()) return
    const convId = await createNewConversation(guestName.trim(), guestEmail.trim())
    if (convId) {
      setPhase('chatting')
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || sending || conversationStatus === 'closed') return

    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      let convId = conversationId

      // Create conversation on first message if needed
      if (!convId) {
        convId = await createNewConversation(user?.email || 'User', null)
        if (!convId) {
          setSending(false)
          setInput(content)
          return
        }
      }

      await sendMessage({
        conversationId: convId,
        senderType: 'customer',
        senderId: user?.id || null,
        content,
      })
    } catch (err) {
      console.error('Failed to send message:', err)
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  function handleNewConversation() {
    clearSession()
    setConversationId(null)
    setMessages([])
    setConversationStatus('open')
    unsubMsgRef.current?.()
    unsubStatusRef.current?.()

    if (user) {
      setPhase('chatting')
    } else {
      setGuestName('')
      setGuestEmail('')
      setPhase('form')
    }
  }

  if (phase === 'loading') return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2 }}
      className="bg-background border shadow-2xl flex flex-col overflow-hidden
        fixed inset-0 h-screen sm:static sm:w-96 sm:h-auto sm:max-h-[70vh] sm:rounded-2xl"
    >
      {/* Header */}
      <div className="flex flex-col items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
        <TopSafeArea extraPX={0} />
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-semibold text-sm">
              {t('adminTitle')}
            </span>
          </div>
          <Button variant="ghost" onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Guest form */}
      {phase === 'form' && (
        <form onSubmit={handleGuestSubmit} className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">{t('guestForm')}</p>
          <Input
            placeholder={t('yourName')}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            autoFocus
          />
          <Input
            placeholder={t('yourEmail')}
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={!guestName.trim()}>
            {t('startChat')}
          </Button>
        </form>
      )}

      {/* Chat view */}
      {phase === 'chatting' && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0" style={{ minHeight: 200 }}>
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                {t('noMessages')}
              </p>
            )}
            {messages.map((msg, i) => {
              const isCustomer = msg.sender_type === 'customer'
              const showLabel = i === 0 || messages[i - 1]?.sender_type !== msg.sender_type
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  {msg.sender_type === 'system' ? (
                    <p className="text-xs text-muted-foreground text-center w-full py-1">
                      {msg.content === 'Conversation closed' ? t('chatEnded') : msg.content}
                    </p>
                  ) : (
                    <>
                      {showLabel && (
                        <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
                          {isCustomer ? t('you') : t('agent')}
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          isCustomer
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

          {/* Input or closed state */}
          {conversationStatus === 'closed' ? (
            <div className="p-3 border-t space-y-2">
              <p className="text-xs text-muted-foreground text-center">{t('chatEnded')}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={handleNewConversation}>
                {t('newConversation')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t">
              <Input
                placeholder={t('typeMessage')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                autoFocus
                className="flex-1"
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
          )}
        </>
      )}
    </motion.div>
  )
}
