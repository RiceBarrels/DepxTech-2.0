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
import 'react-flagpack/dist/style.css'

const localeLabels = {
  ar: 'العربية',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  sv: 'Svenska',
  'zh-CN': '简体中文',
  'zh-HK': '繁體中文',
}

const localeFlags = {
  ar: 'SA',
  de: 'DE',
  en: 'US',
  es: 'ES',
  fr: 'FR',
  it: 'IT',
  ja: 'JP',
  ko: 'KR',
  nl: 'NL',
  pl: 'PL',
  pt: 'PT',
  ru: 'RU',
  sv: 'SE',
  'zh-CN': 'CN',
  'zh-HK': 'HK',
}

function FlagImg({ code, size = 'l', label, className = '' }) {
  return (
    <div className={`flag real-linear size-${size} border border-radius ${className}`.trim()}>
      <img src={`/flags/${size}/${code}.svg`} alt={label} />
    </div>
  )
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
        <SelectTrigger className="w-auto h-6 gap-1.5 px-4 text-xs border-none py-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {routing.locales.map((l) => (
            <SelectItem key={l} value={l} className="text-xs">
              <div className="flex items-center gap-2">
                <FlagImg code={localeFlags[l]} size="S" label={localeLabels[l]} />
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
        <FlagImg code={localeFlags[locale]} size="M" label={localeLabels[locale]} className="shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            <div className="flex items-center gap-2">
              <FlagImg code={localeFlags[l]} size="M" label={localeLabels[l]} />
              <span>{localeLabels[l]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
