"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const DISMISSED_KEY = "depx-us-only-dismissed"

export default function OnlyUSDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code !== "US") {
          setOpen(true)
        }
      })
      .catch(() => {})
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center">US-Only Trade-Ins</DialogTitle>
          <DialogDescription className="text-center">
            We currently only accept trade-ins from the United States. You&#39;re welcome to browse the site, but trade-in submissions are limited to US addresses at this time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleDismiss}>
            Got it, continue browsing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
