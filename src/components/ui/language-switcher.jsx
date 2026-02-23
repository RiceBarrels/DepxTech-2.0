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
import Flag from 'react-flagpack'
import 'react-flagpack/dist/style.css'

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

const localeFlags = {
  en: 'US',
  'zh-CN': 'CN',
  'zh-TW': 'TW',
  ar: 'SA',
  nl: 'NL',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  ja: 'JP',
  ko: 'KR',
  pl: 'PL',
  pt: 'PT',
  ru: 'RU',
  es: 'ES',
  sv: 'SE',
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
      <Select value={locale} onValueChange={handleChange} popover>
        <SelectTrigger className="w-auto h-7 gap-1.5 px-4 text-xs border-none">
          <Flag
            code={localeFlags[locale]}
            size="S"
            hasBorderRadius
            hasBorder={false}
            className="shrink-0"
          />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {routing.locales.map((l) => (
            <SelectItem key={l} value={l} className="text-xs">
              <div className="flex items-center gap-2">
                <Flag
                  code={localeFlags[l]}
                  size="S"
                  gradient="real-linear"
                  hasBorderRadius
                />
                <span>{localeLabels[l]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[160px] h-8 gap-2 text-sm">
        <Flag
          code={localeFlags[locale]}
          size="M"
          gradient="real-linear"
          hasBorderRadius
          className="shrink-0"
        />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            <div className="flex items-center gap-2">
              <Flag
                code={localeFlags[l]}
                size="M"
                gradient="real-linear"
                hasBorderRadius
              />
              <span>{localeLabels[l]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
