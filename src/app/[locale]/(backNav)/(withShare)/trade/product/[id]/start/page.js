import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import TradeProductStartClient from './page.client'
import { getTranslations } from 'next-intl/server'
import { resolveTradeProduct } from '@/lib/i18n-db'

export async function generateMetadata({ params }) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'trade.product' })

  try {
    const { data: product } = await supabaseAdmin
      .from('tradable_products')
      .select('*')
      .eq('id', id)
      .single()

    if (!product) {
      return { title: t('notFound') }
    }

    const resolved = resolveTradeProduct(product, locale)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

    return {
      title: t('startTradeIn', { title: resolved.title }),
      description: t('metaDesc', { title: resolved.title }),
      openGraph: {
        title: t('startTradeIn', { title: resolved.title }),
        description: t('metaDesc', { title: resolved.title }),
        type: 'website',
        url: `${baseUrl}/${locale}/trade/product/${id}/start`,
      },
      alternates: {
        canonical: `${baseUrl}/${locale}/trade/product/${id}/start`,
      },
    }
  } catch (error) {
    return { title: t('fallbackTitle') }
  }
}

// Calculate depreciation based on admin-set depreciation rate
function calculateDepreciation(depreciationRate, t) {
  const rate = Number(depreciationRate) || 0
  const multiplier = 100 - rate

  let label = t('depreciationCurrent')
  if (rate >= 50) label = t('depreciationSignificant')
  else if (rate >= 30) label = t('depreciationModerate')
  else if (rate >= 10) label = t('depreciationMinor')
  else if (rate > 0) label = t('depreciationLikeNew')

  return { multiplier, label, rate }
}

export default async function TradeProductStartPage({ params }) {
  const { id, locale } = await params
  const t = await getTranslations('trade.product')

  // Fetch product data
  const { data: rawProduct, error } = await supabaseAdmin
    .from('tradable_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !rawProduct) {
    notFound()
  }

  // Resolve i18n fields based on locale
  const product = resolveTradeProduct(rawProduct, locale)

  // Use product-specific questions from the questions column
  const productQuestions = product.questions || []

  // Calculate base price with depreciation
  const basePrice = Number(product.base_price) || 0
  const depreciation = calculateDepreciation(product.depreciation_rate, t)
  const depreciatedPrice = basePrice * (depreciation.multiplier / 100)

  return (
    <TradeProductStartClient
      product={product}
      questions={productQuestions}
      basePrice={depreciatedPrice}
      minPrice={product.min_price ? Number(product.min_price) : null}
      depreciation={depreciation}
    />
  )
}
