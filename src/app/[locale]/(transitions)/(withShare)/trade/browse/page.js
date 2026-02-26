import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations } from 'next-intl/server'
import TradeBrowseSteps from '@/components/trade/TradeBrowseSteps'
import { resolveTradeProduct } from '@/lib/i18n-db'

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'trade.browse' })

  // Resolve category name from slug
  let categoryName = null
  if (sp.category) {
    const { data: cat } = await supabaseAdmin
      .from('trade_categories')
      .select('name')
      .eq('slug', sp.category)
      .single()
    categoryName = cat?.name || sp.category
  }

  const parts = [categoryName, sp.brand, sp.series].filter(Boolean)
  const title = parts.length > 0
    ? t('metaTitleFiltered', { parts: parts.join(' ') })
    : t('metaTitleDefault')
  const description = parts.length > 0
    ? t('metaDescFiltered', { parts: parts.join(' ') })
    : t('metaDescDefault')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  const params_str = new URLSearchParams(
    Object.fromEntries(Object.entries({ category: sp.category, brand: sp.brand, series: sp.series }).filter(([, v]) => v))
  ).toString()

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: { title, description, url: `${baseUrl}/trade/browse${params_str ? `?${params_str}` : ''}` },
    alternates: { canonical: `${baseUrl}/trade/browse${params_str ? `?${params_str}` : ''}` },
  }
}

export default async function TradeBrowsePage({ params, searchParams }) {
  const { locale } = await params
  const sp = await searchParams
  const categorySlug = sp.category || null
  const brand = sp.brand || null

  // Resolve category from slug
  let categoryData = null
  if (categorySlug) {
    const { data: cat } = await supabaseAdmin
      .from('trade_categories')
      .select('*')
      .eq('slug', categorySlug)
      .single()
    categoryData = cat || null
  }

  const categoryName = categoryData?.name || null

  // Fetch brands for the selected category
  let brands = []
  if (categoryName) {
    // Get brand names that have products in this category
    const { data: productBrands } = await supabaseAdmin
      .from('tradable_products')
      .select('brand')
      .eq('category', categoryName)
    const brandNames = [...new Set((productBrands || []).map(r => r.brand).filter(Boolean))]

    // Fetch brand logos from brands table
    const { data: brandRows } = await supabaseAdmin
      .from('brands')
      .select('name, img')
      .in('name', brandNames)

    const brandMap = new Map((brandRows || []).map(b => [b.name, b.img]))
    brands = brandNames.map(name => ({ name, img: brandMap.get(name) || null })).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  // Fetch series for the selected brand
  let seriesList = []
  if (categoryName && brand) {
    const { data } = await supabaseAdmin
      .from('tradable_products')
      .select('series')
      .eq('category', categoryName)
      .eq('brand', brand)
    seriesList = [...new Set((data || []).map((r) => r.series).filter(Boolean))].sort()
  }

  // Fetch products when brand is selected
  let products = []
  if (categoryName && brand) {
    const { data } = await supabaseAdmin
      .from('tradable_products')
      .select('id, title, title_i18n, base_price, imgs, des, des_i18n, brand, category, series, views, questions')
      .eq('category', categoryName)
      .eq('brand', brand)
      .order('base_price', { ascending: false })

    products = (data || []).map((p) => resolveTradeProduct(p, locale))
  }

  // Auto-skip logic
  const autoSkip = {}
  if (categoryName && brands.length === 1 && !brand) {
    autoSkip.brand = brands[0].name
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2 py-4 sm:py-8 sm:px-4">
        <TradeBrowseSteps
          categoryData={categoryData}
          brand={brand}
          brands={brands}
          seriesList={seriesList}
          products={products}
          autoSkip={autoSkip}
        />
      </div>
    </div>
  )
}
