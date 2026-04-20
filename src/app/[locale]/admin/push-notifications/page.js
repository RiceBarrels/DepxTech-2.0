"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  BellIcon,
  SendIcon,
  Loader2,
  TrashIcon,
  LinkIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

export default function PushNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [url, setUrl] = useState("")
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/push-notifications")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/admin/push-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || null,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Notification sent to ${data.sentTo} user(s)`)
        setTitle("")
        setBody("")
        setUrl("")
        fetchNotifications()
      } else {
        toast.error(data.error || "Failed to send notification")
      }
    } catch {
      toast.error("Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/push-notifications?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        toast.success("Notification deleted")
      } else {
        toast.error("Failed to delete notification")
      }
    } catch {
      toast.error("Failed to delete notification")
    } finally {
      setDeleting(null)
    }
  }

  function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Push Notifications</h1>
        <p className="text-muted-foreground">
          Send push notifications to all subscribed users
        </p>
      </div>

      {/* Send notification form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SendIcon className="h-5 w-5" />
            Send New Notification
          </CardTitle>
          <CardDescription>
            This will send a push notification and add it to the inbox of all
            users with push subscriptions enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Notification message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5" />
                Redirect URL (optional)
              </Label>
              <Input
                id="url"
                placeholder="/offers or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Users will be redirected to this URL when they click the
                notification in their inbox.
              </p>
            </div>

            <Button type="submit" disabled={sending || !title.trim() || !body.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <SendIcon className="h-4 w-4 mr-2" />
              )}
              {sending ? "Sending..." : "Send Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Notification History
          </CardTitle>
          <CardDescription>
            Previously sent push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <Badge variant="secondary" className="shrink-0">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        {notif.sent_count}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notif.body}
                    </p>
                    {notif.url && (
                      <p className="text-xs text-blue-500 mt-1 truncate">
                        <LinkIcon className="h-3 w-3 inline mr-1" />
                        {notif.url}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(notif.id)}
                    disabled={deleting === notif.id}
                  >
                    {deleting === notif.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
