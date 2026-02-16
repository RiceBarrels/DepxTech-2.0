'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Globe } from 'lucide-react'

const LOCALE_NAMES = {
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

const ALL_LOCALES = Object.keys(LOCALE_NAMES)

/**
 * Translation editor for i18n JSONB fields.
 * Renders expandable locale rows with editable inputs.
 *
 * @param {Object} props
 * @param {Array<{key: string, label: string, value: string}>} props.fields
 *   The source fields, e.g. [{key: 'title', label: 'Title', value: 'My Post'}, {key: 'excerpt', label: 'Excerpt', value: '...'}]
 * @param {Object} props.i18nData
 *   The current i18n state, e.g. { title_i18n: { 'zh-CN': '...', 'ja': '...' }, excerpt_i18n: { ... } }
 * @param {Function} props.onChange
 *   Called with (fieldKey + '_i18n', updatedObject) when a translation changes
 */
export default function TranslationEditor({ fields, i18nData, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedLocales, setExpandedLocales] = useState({})

  const translatedCount = fields.reduce((max, f) => {
    const data = i18nData[`${f.key}_i18n`] || {}
    return Math.max(max, Object.keys(data).filter((k) => data[k]).length)
  }, 0)

  const toggleLocale = (locale) => {
    setExpandedLocales((prev) => ({ ...prev, [locale]: !prev[locale] }))
  }

  const handleFieldChange = (fieldKey, locale, value) => {
    const i18nKey = `${fieldKey}_i18n`
    const current = i18nData[i18nKey] || {}
    onChange(i18nKey, { ...current, [locale]: value })
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-between px-2 h-9"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Globe className="w-4 h-4" />
          Translations
        </span>
        <span className="flex items-center gap-2">
          {translatedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {translatedCount}/{ALL_LOCALES.length}
            </Badge>
          )}
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </Button>

      {expanded && (
        <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
          {ALL_LOCALES.map((locale) => {
            const isLocaleExpanded = expandedLocales[locale]
            const hasAny = fields.some((f) => {
              const data = i18nData[`${f.key}_i18n`] || {}
              return data[locale]
            })

            return (
              <div key={locale}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => toggleLocale(locale)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{LOCALE_NAMES[locale]}</span>
                    <span className="text-xs text-muted-foreground">{locale}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {hasAny && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                    {isLocaleExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </span>
                </button>

                {isLocaleExpanded && (
                  <div className="px-3 pb-3 space-y-2 bg-muted/20">
                    {fields.map((field) => {
                      const data = i18nData[`${field.key}_i18n`] || {}
                      return (
                        <div key={field.key}>
                          <Label className="text-xs text-muted-foreground">
                            {field.label}
                            {field.value && (
                              <span className="ml-1 text-xs opacity-50">
                                (EN: {field.value.length > 40 ? field.value.slice(0, 40) + '...' : field.value})
                              </span>
                            )}
                          </Label>
                          <Input
                            value={data[locale] || ''}
                            onChange={(e) => handleFieldChange(field.key, locale, e.target.value)}
                            placeholder={`${field.label} in ${LOCALE_NAMES[locale]}`}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
