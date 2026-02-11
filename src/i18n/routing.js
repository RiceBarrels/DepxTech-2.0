import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh-CN', 'zh-TW', 'ar', 'nl', 'fr', 'de', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'es', 'sv'],
  defaultLocale: 'en',
  localePrefix: 'always'
})
