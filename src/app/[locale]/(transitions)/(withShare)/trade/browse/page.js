import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations } from 'next-intl/server'
import TradeBrowseSteps from '@/components/trade/TradeBrowseSteps'

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'trade.browse' })
  const parts = [sp.category, sp.brand, sp.series].filter(Boolean)
  const title = parts.length > 0
    ? t('metaTitleFiltered', { parts: parts.join(' ') })
    : t('metaTitleDefault')
  const description = parts.length > 0
    ? t('metaDescFiltered', { parts: parts.join(' ') })
    : t('metaDescDefault')

  return { title, description, robots: { index: true, follow: true } }
}

export default async function TradeBrowsePage({ searchParams }) {
  const sp = await searchParams
  const category = sp.category || null
  const brand = sp.brand || null
  const series = sp.series || null

  // Fetch brands for the selected category
  let brands = []
  if (category) {
    const { data } = await supabaseAdmin
      .from('tradable_products')
      .select('brand, brand_img')
      .eq('category', category)
    const brandMap = new Map()
    ;(data || []).forEach((row) => {
      if (!brandMap.has(row.brand)) {
        brandMap.set(row.brand, row.brand_img)
      }
    })
    brands = Array.from(brandMap, ([name, img]) => ({ name, img })).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  // Fetch series for the selected brand
  let seriesList = []
  if (category && brand) {
    const { data } = await supabaseAdmin
      .from('tradable_products')
      .select('series')
      .eq('category', category)
      .eq('brand', brand)
    seriesList = [...new Set((data || []).map((r) => r.series).filter(Boolean))].sort()
  }

  // Fetch products when selection is complete
  let products = []
  const seriesSkipped = category && brand && seriesList.length === 0
  if (category && brand && (seriesSkipped || series)) {
    let query = supabaseAdmin
      .from('tradable_products')
      .select('id, title, base_price, imgs, des, brand, category, series, views')
      .eq('category', category)
      .eq('brand', brand)
      .order('base_price', { ascending: false })

    if (series) query = query.eq('series', series)

    const { data } = await query
    products = data || []
  }

  // Auto-skip logic
  const autoSkip = {}
  if (category && brands.length === 1 && !brand) {
    autoSkip.brand = brands[0].name
  }
  if (category && brand && seriesList.length === 1 && !series) {
    autoSkip.series = seriesList[0]
  }
  if (seriesSkipped) {
    autoSkip.seriesSkipped = true
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2 py-4 sm:py-8 sm:px-4">
        <TradeBrowseSteps
          category={category}
          brand={brand}
          series={series}
          brands={brands}
          seriesList={seriesList}
          products={products}
          autoSkip={autoSkip}
        />
      </div>
    </div>
  )
}
