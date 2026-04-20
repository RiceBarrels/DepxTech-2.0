import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

function merge(fallback, override) {
  const result = { ...fallback }
  for (const key in override) {
    if (
      override[key] &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      fallback[key] &&
      typeof fallback[key] === 'object'
    ) {
      result[key] = merge(fallback[key], override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale
  }

  const enMessages = (await import('../../messages/en.json')).default
  const messages = locale === 'en'
    ? enMessages
    : merge(enMessages, (await import(`../../messages/${locale}.json`)).default)

  return { locale, messages }
})
