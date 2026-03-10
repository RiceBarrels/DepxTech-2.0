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
import * as Flags from 'country-flag-icons/react/3x2'

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

function FlagIcon({ code, label, className = '' }) {
  const Flag = Flags[code]
  if (!Flag) return null
  return <Flag title={label} className={`inline-block rounded-sm ${className}`} />
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
                <FlagIcon code={localeFlags[l]} label={localeLabels[l]} className="w-4 h-3" />
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
        <FlagIcon code={localeFlags[locale]} label={localeLabels[locale]} className="w-5 h-3.5 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            <div className="flex items-center gap-2">
              <FlagIcon code={localeFlags[l]} label={localeLabels[l]} className="w-5 h-3.5" />
              <span>{localeLabels[l]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
