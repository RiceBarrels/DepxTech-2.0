"use client"

import { useTranslations } from 'next-intl'

export default function InboxPage() {
  const t = useTranslations('account.inboxPage')
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}