'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function TransitionsErrorPage({ error, reset }) {
  const t = useTranslations('error')

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-muted-foreground mb-6">{t('description')}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>{t('tryAgain')}</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>{t('goHome')}</Button>
        </div>
      </div>
    </div>
  )
}
