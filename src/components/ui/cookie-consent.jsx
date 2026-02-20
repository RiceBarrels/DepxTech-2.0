'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'depxtech-cookie-consent'

export function CookieConsent() {
  const t = useTranslations('cookieConsent')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (!accepted) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-lg mx-auto bg-background/95 backdrop-blur-xl border rounded-2xl shadow-2xl p-4 flex items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              {t('message')}{' '}
              <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                {t('learnMore')}
              </Link>
            </p>
            <Button size="sm" onClick={accept} className="shrink-0">
              {t('accept')}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
