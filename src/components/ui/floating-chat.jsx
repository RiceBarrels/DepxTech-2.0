'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { ChatWidget } from '@/components/chat/ChatWidget'

export function FloatingChat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-36 sm:bottom-20 right-4 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && <ChatWidget onClose={() => setOpen(false)} />}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat support"
        className="size-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  )
}
