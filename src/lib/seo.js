import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

export const ogLocaleMap = {
  en: 'en_US', 'zh-CN': 'zh_CN', 'zh-HK': 'zh_HK', ar: 'ar_AR',
  nl: 'nl_NL', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', ja: 'ja_JP',
  ko: 'ko_KR', pl: 'pl_PL', pt: 'pt_BR', ru: 'ru_RU', es: 'es_ES', sv: 'sv_SE',
}

/**
 * Build full SEO metadata for a public page.
 * @param {string} locale
 * @param {object} opts
 * @param {string} opts.titleKey - Key in the namespace (e.g. 'howItWorksTitle')
 * @param {string} opts.descKey - Key in the namespace (e.g. 'howItWorksDescription')
 * @param {string} opts.path - URL path without locale prefix (e.g. '/trade/how-it-works')
 * @param {string} [opts.namespace='metadata'] - i18n namespace
 */
export async function buildPageMeta(locale, { titleKey, descKey, path, namespace = 'metadata' }) {
  const t = await getTranslations({ locale, namespace })
  const title = t(titleKey)
  const description = t(descKey)
  const url = `${baseUrl}/${locale}${path}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'DepxTech',
      locale: ogLocaleMap[locale] || 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${baseUrl}/${l}${path}`])
      ),
    },
  }
}
