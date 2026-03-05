'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebHaptics } from 'web-haptics/react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { trigger } = useWebHaptics()

  useEffect(() => {
    const scrollContainer = document.querySelector('[style*="view-transition-name: main-content"]')
    if (!scrollContainer) return

    const handleScroll = () => {
      setVisible(scrollContainer.scrollTop > 400)
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('[style*="view-transition-name: main-content"]')
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          aria-label="Back to top"
          className="fixed bottom-24 sm:bottom-8 right-4 z-40 size-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          onClick={() => {
            trigger([
              { duration: 170 },
              { delay: 50, duration: 50 },
            ], { intensity: 1 })
            scrollToTop()
          }}
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
