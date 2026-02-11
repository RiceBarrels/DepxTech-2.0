"use client"

import { useTranslations } from 'next-intl'

export default function MembershipPage() {
  const t = useTranslations('account.membershipPage')
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}