import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations } from 'next-intl/server'
import CustomTradeInForm from './page.client'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'trade.custom' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    robots: { index: true, follow: true },
  }
}

export default async function CustomTradeInPage() {
  const { data: categories } = await supabaseAdmin
    .from('trade_categories')
    .select('name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <CustomTradeInForm categories={categories || []} />
      </div>
    </div>
  )
}
