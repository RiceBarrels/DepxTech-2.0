import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { resolveTradeProduct } from '@/lib/i18n-db'
import TradeResultPageClient from './page.client'

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

    return {
      title: t('metaTitle', { title: resolved.title }),
      description: t('metaDesc', { title: resolved.title }),
    }
  } catch (error) {
    return { title: t('fallbackTitle') }
  }
}

export default async function TradeResultPage({ params }) {
  const { id, locale } = await params
  const t = await getTranslations('trade.product')

  const { data: rawProduct, error } = await supabaseAdmin
    .from('tradable_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !rawProduct) {
    notFound()
  }

  const product = resolveTradeProduct(rawProduct, locale)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <TradeResultPageClient product={product} />
      </div>
    </div>
  )
}
