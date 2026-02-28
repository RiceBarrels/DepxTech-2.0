"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InboxIcon,
  Loader2,
  CheckCheck,
  ArrowRightLeft,
  BellIcon,
  ExternalLinkIcon,
  MegaphoneIcon,
} from "lucide-react"
import { toast } from "sonner"
import { TransitionLink } from "@/components/ui/pageTransitions"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useTranslations } from 'next-intl'

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

const statusConfig = {
  approved: { label: 'Approved', variant: 'default', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', variant: 'destructive', className: '' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-blue-100 text-blue-800' },
  pending: { label: 'Pending', variant: 'secondary', className: '' },
}

export default function InboxPage() {
  const t = useTranslations('account.inboxPage')
  const { user } = useAuth()
  const router = useTransitionRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchNotifications = useCallback(async (before = null) => {
    try {
      const params = new URLSearchParams({ limit: '20' })
      if (before) params.set('before', before)

      const res = await fetch(`/api/notifications?${params}`)
      const data = await res.json()

      if (data.success) {
        const newNotifs = data.notifications || []
        setNotifications(prev => before ? [...prev, ...newNotifs] : newNotifs)
        setHasMore(newNotifs.length === 20)
      }
    } catch {
      toast.error(t('errorLoad'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [t])

  useEffect(() => {
    if (user) fetchNotifications()
    else setLoading(false)
  }, [user, fetchNotifications])

  // Supabase Realtime: live new notifications
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    const channel = supabase
      .channel('inbox-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = async (ids) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      setNotifications(prev =>
        prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
      )
    } catch {
      toast.error(t('errorMarkRead'))
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      toast.error(t('errorMarkRead'))
    }
  }

  const loadMore = () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    const last = notifications[notifications.length - 1]
    fetchNotifications(last?.created_at)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <h2 className="text-xl font-semibold mb-2">{t('pleaseLogIn')}</h2>
            <p className="text-muted-foreground mb-4">{t('needLogIn')}</p>
            <TransitionLink href="/login">
              <Button>{t('goToLogin')}</Button>
            </TransitionLink>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            {t('markAllRead')}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t('loading')}</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <InboxIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('empty')}</h2>
            <p className="text-muted-foreground mb-4 text-center">{t('emptyDesc')}</p>
            <TransitionLink href="/trade">
              <Button>{t('browseTradeIn')}</Button>
            </TransitionLink>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const status = notif.data?.status
            const cfg = statusConfig[status] || statusConfig.pending

            const notifUrl = notif.url || notif.data?.url

            return (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${!notif.read ? 'border-primary/30 bg-primary/2' : ''}`}
                onClick={() => {
                  if (!notif.read) markAsRead([notif.id])
                  if (notifUrl) {
                    if (notifUrl.startsWith('http')) {
                      window.open(notifUrl, '_blank')
                    } else {
                      router.push(notifUrl)
                    }
                  }
                }}
              >
                <CardContent className="flex items-start gap-4 py-4">
                  <div className="relative mt-1 shrink-0">
                    {notif.type === 'trade_status' ? (
                      <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    ) : notif.type === 'admin_push' ? (
                      <MegaphoneIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <BellIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                    {!notif.read && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold' : 'font-medium'}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {status && (
                        <>
                          <Badge className={cfg.className} variant={cfg.variant}>
                            {cfg.label}
                          </Badge>
                          {notif.data?.estimated_value && (
                            <span className="text-sm font-semibold text-green-600">
                              ${Number(notif.data.estimated_value).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                      {notifUrl && (
                        <span className="text-xs text-blue-500 flex items-center gap-1">
                          <ExternalLinkIcon className="h-3 w-3" />
                          {t('viewDetails') || 'View details'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('loadMore')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
