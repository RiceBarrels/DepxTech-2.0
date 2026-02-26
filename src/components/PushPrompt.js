"use client"

import { useState, useEffect } from "react"
import { BellIcon, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { subscribeToPush } from "@/lib/pushClient"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

const LS_KEY = "isNotificationAllowed"

export default function PushPrompt() {
  const { user } = useAuth()
  const t = useTranslations("trade.product")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    // If the key exists at all (true or false), don't show
    if (localStorage.getItem(LS_KEY) !== null) return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    if (Notification.permission === "denied") return

    // Check if user has an ongoing trade-in
    fetch("/api/user/trade-quotes")
      .then((res) => res.json())
      .then((data) => {
        if (!data.quotes?.length) return
        const hasOngoing = data.quotes.some(
          (q) => q.status === "pending" || q.status === "approved"
        )
        if (!hasOngoing) return

        // Check if already subscribed in browser
        navigator.serviceWorker.ready
          .then((reg) => reg.pushManager.getSubscription())
          .then((existing) => {
            if (existing) {
              // Already subscribed, mark as allowed
              localStorage.setItem(LS_KEY, "true")
              return
            }
            setOpen(true)
          })
      })
      .catch(() => {})
  }, [user?.id])

  const handleEnable = async () => {
    setLoading(true)
    try {
      const sub = await subscribeToPush()
      if (sub) {
        localStorage.setItem(LS_KEY, "true")
        toast.success(t("pushEnabled"))
      } else {
        localStorage.setItem(LS_KEY, "false")
      }
    } catch {
      toast.error(t("pushFailed"))
      localStorage.setItem(LS_KEY, "false")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem(LS_KEY, "false")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BellIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{t("pushDialogTitle")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("pushDialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleEnable} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellIcon className="w-4 h-4" />}
            {t("pushDialogEnable")}
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="w-full">
            {t("pushDialogSkip")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
