import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Shield, Truck, Clock, DollarSign, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { TradeProductStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { resolveTradeProduct } from '@/lib/i18n-db'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'

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
      title: t('metaTitle', { title: resolved.title }),
      description: t('metaDesc', { title: resolved.title }),
      keywords: [`trade in ${resolved.title}`, product.brand, product.series, product.category, 'depxtech', 'trade in'],
      openGraph: {
        title: t('metaTitle', { title: resolved.title }),
        description: t('metaDesc', { title: resolved.title }),
        type: 'website',
        url: `${baseUrl}/trade/product/${id}`,
        images: product.imgs && product.imgs.length > 0 ? [product.imgs[0]] : [],
      },
      alternates: {
        canonical: `${baseUrl}/trade/product/${id}`,
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

export default async function TradeProductPage({ params }) {
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

  // Lookup category slug for URLs
  if (product.category) {
    const { data: catRow } = await supabaseAdmin
      .from('trade_categories')
      .select('slug')
      .eq('name', product.category)
      .single()
    product._categorySlug = catRow?.slug || null
  }

  // Increment views
  await supabaseAdmin
    .from('tradable_products')
    .update({ views: (product.views || 0) + 1 })
    .eq('id', id)

  // Calculate base price with depreciation
  const basePrice = Number(product.base_price) || 0
  const depreciation = calculateDepreciation(product.depreciation_rate, t)
  const depreciatedPrice = basePrice * (depreciation.multiplier / 100)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  return (
    <div className="min-h-screen">
      <TradeProductStructuredData product={product} depreciatedPrice={depreciatedPrice} />
      <BreadcrumbStructuredData items={[
        { name: 'Trade-In', url: `${baseUrl}/trade` },
        { name: product.category, url: `${baseUrl}/trade/browse/${product._categorySlug || encodeURIComponent(product.category).toLowerCase()}` },
        { name: product.brand, url: `${baseUrl}/trade/browse/${product._categorySlug || encodeURIComponent(product.category).toLowerCase()}/${encodeURIComponent(product.brand)}` },
        { name: product.title, url: `${baseUrl}/trade/product/${product.id}` },
      ]} />
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Product Image */}
            <div className="order-1 lg:order-1">
              {product.imgs && product.imgs.length > 0 && (
                <div className="relative w-full max-w-md mx-auto">
                  <div
                    className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700/50 p-6 lg:p-8"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={product.imgs[0]}
                        alt={product.title + " png - DepxTech"}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="order-2 lg:order-2 space-y-5">
              <div>
                <Badge variant="secondary" className="mb-3 text-xs">
                  {product.brand} • {product.series}
                </Badge>
                <h1
                  className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
                >
                  {product.title}
                </h1>
                {product.des && (
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{product.des}</p>
                )}
              </div>

              {/* Price Display */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">{t('tradeInUpTo')}</span>
                </div>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${depreciatedPrice.toFixed(2)}
                </p>
                {depreciation.multiplier < 100 && (
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">
                    {depreciation.label}
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('bestPrice')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('guaranteed')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('shipping')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('free')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('payment')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('24hours')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('dataWipe')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('certified')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop CTA Section */}
      <div className="hidden lg:block max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('readyToStart')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('answerFewQuestions')}
            </p>
          </div>

          <TransitionLink href={`/trade/product/${id}/start`}>
            <Button size="lg" className="px-8 py-6 text-lg gap-2">
              {t('startTradeIn')} <ChevronRight className="w-5 h-5" />
            </Button>
          </TransitionLink>
        </div>
      </div>

      {/* Mobile spacing for fixed button */}
      <div className="lg:hidden h-24" />

      {/* Mobile Fixed Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border z-50 [@media(display-mode:standalone)]:pb-20">
        <TransitionLink href={`/trade/product/${id}/start`} className="block">
          <Button size="lg" className="w-full gap-2">
            {t('startTradeIn')} <ChevronRight className="w-5 h-5" />
          </Button>
        </TransitionLink>
      </div>
    </div>
  )
}
