"use client"

import { useTranslations } from 'next-intl'
import { WifiOffIcon, RefreshCwIcon, HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function OfflinePage() {
  const t = useTranslations('offline')
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/lightLogo.svg"
            alt="DepxTech"
            width={48}
            height={48}
            className="block dark:hidden"
          />
          <Image
            src="/darkLogo.svg"
            alt="DepxTech"
            width={48}
            height={48}
            className="hidden dark:block"
          />
        </div>

        <div className="w-24 h-24 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center">
          <WifiOffIcon className="w-12 h-12 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4">{t('youreOffline')}</h1>

        <p className="text-muted-foreground mb-8">
          {t('offlineDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            {t('tryAgain')}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            {t('goHome')}
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {t('offlineNote')}
        </p>
      </div>
    </div>
  )
}
