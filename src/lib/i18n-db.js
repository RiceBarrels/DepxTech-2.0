/**
 * Resolve a localized field from a JSONB i18n column.
 * Falls back to the original column value if no translation exists.
 *
 * Usage:
 *   resolveI18n(product, 'title', 'zh-CN')
 *   // checks product.title_i18n?.['zh-CN'], falls back to product.title
 */
export function resolveI18n(row, field, locale) {
  if (!row || !locale) return row?.[field] ?? ''

  const i18nField = `${field}_i18n`
  const translations = row[i18nField]

  if (translations && typeof translations === 'object' && translations[locale]) {
    return translations[locale]
  }

  // Fallback to base locale (e.g., 'zh' for 'zh-CN')
  if (locale.includes('-')) {
    const baseLocale = locale.split('-')[0]
    if (translations && translations[baseLocale]) {
      return translations[baseLocale]
    }
  }

  // Fallback to original column
  return row[field] ?? ''
}

/**
 * Resolve all i18n fields on a tradable product.
 * Returns a new object with resolved values.
 */
export function resolveTradeProduct(product, locale) {
  if (!product) return product

  return {
    ...product,
    title: resolveI18n(product, 'title', locale),
    des: resolveI18n(product, 'des', locale),
    questions: resolveQuestionsI18n(product, locale),
  }
}

/**
 * Resolve localized questions.
 * questions_i18n: { "zh-CN": [...questions] }
 * Falls back to product.questions if no locale version exists.
 */
function resolveQuestionsI18n(product, locale) {
  if (!product || !locale) return product?.questions || []

  const i18nQuestions = product.questions_i18n
  if (i18nQuestions && typeof i18nQuestions === 'object') {
    if (i18nQuestions[locale]) return i18nQuestions[locale]

    // Fallback to base locale
    if (locale.includes('-')) {
      const baseLocale = locale.split('-')[0]
      if (i18nQuestions[baseLocale]) return i18nQuestions[baseLocale]
    }
  }

  return product.questions || []
}

/**
 * Resolve all i18n fields on a blog post.
 */
export function resolveBlogPost(post, locale) {
  if (!post) return post

  return {
    ...post,
    title: resolveI18n(post, 'title', locale),
    excerpt: resolveI18n(post, 'excerpt', locale),
  }
}
