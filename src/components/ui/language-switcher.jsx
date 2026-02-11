'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GlobeIcon } from 'lucide-react'

const localeLabels = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ar: 'العربية',
  nl: 'Nederlands',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  es: 'Español',
  sv: 'Svenska',
}

export function LanguageSwitcher({ variant = 'default' }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale) => {
    router.replace(pathname, { locale: newLocale })
  }

  if (variant === 'compact') {
    return (
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger className="w-auto h-7 gap-1 px-2 text-xs border-none bg-transparent">
          <GlobeIcon className="size-3" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {routing.locales.map((l) => (
            <SelectItem key={l} value={l} className="text-xs">
              {localeLabels[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px] h-8 gap-1.5 text-sm">
        <GlobeIcon className="size-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {localeLabels[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
