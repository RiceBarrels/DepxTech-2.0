import { supabaseAdmin } from '@/lib/supabase-admin'
import { getTranslations } from 'next-intl/server'
import TradeBrowseSteps from '@/components/trade/TradeBrowseSteps'
import { resolveTradeProduct } from '@/lib/i18n-db'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Eye } from 'lucide-react'

// Calculate maximum trade-in value based on questions
function calculateUpToValue(product) {
  const basePrice = product.base_price || 0
  const questions = product.questions || []
  if (questions.length === 0) return basePrice

  const totalPercentage = questions.reduce((total, question) => {
    const answers = question.ans || []
    if (answers.length === 0) return total
    if (question.type === 'opposite_multiple') return total
    const maxPercentage = answers.reduce((max, answer) => {
      const percentStr = (answer.persentage || '').trim()
      if (percentStr === '') return max
      const percent = parseFloat(percentStr.replace('+', ''))
      return isNaN(percent) ? max : Math.max(max, percent)
    }, 0)
    return total + maxPercentage
  }, 0)

  return basePrice + (basePrice * totalPercentage / 100)
}

export async function generateMetadata({ params }) {
  const { locale, segments } = await params
  const t = await getTranslations({ locale, namespace: 'trade.browse' })

  const categorySlug = segments?.[0] || null
  const brand = segments?.[1] ? decodeURIComponent(segments[1]) : null

  let categoryName = null
  if (categorySlug) {
    const { data: cat } = await supabaseAdmin
      .from('trade_categories')
      .select('name')
      .eq('slug', categorySlug)
      .single()
    categoryName = cat?.name || categorySlug
  }

  const parts = [categoryName, brand].filter(Boolean)
  const title = parts.length > 0
    ? t('metaTitleFiltered', { parts: parts.join(' ') })
    : t('metaTitleDefault')
  const description = parts.length > 0
    ? t('metaDescFiltered', { parts: parts.join(' ') })
    : t('metaDescDefault')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  const pathParts = [categorySlug, brand ? encodeURIComponent(brand) : null].filter(Boolean)
  const browsePath = `/trade/browse${pathParts.length > 0 ? '/' + pathParts.join('/') : ''}`

  const keywords = [
    'trade in', 'trade-in', categoryName, brand,
    categoryName && `trade in ${categoryName}`,
    brand && `trade in ${brand}`,
    brand && categoryName && `trade in ${brand} ${categoryName}`,
    'depxtech', 'sell used electronics',
  ].filter(Boolean)

  return {
    title,
    description,
    keywords,
    robots: { index: true, follow: true },
    openGraph: {
      title, description,
      url: `${baseUrl}${browsePath}`,
      type: 'website',
      siteName: 'DepxTech',
    },
    alternates: { canonical: `${baseUrl}${browsePath}` },
  }
}

export default async function TradeBrowsePage({ params }) {
  const { locale, segments } = await params
  const t = await getTranslations({ locale, namespace: 'trade.browse' })

  const categorySlug = segments?.[0] || null
  const brand = segments?.[1] ? decodeURIComponent(segments[1]) : null

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
    const { data: productBrands } = await supabaseAdmin
      .from('tradable_products')
      .select('brand')
      .eq('category', categoryName)
    const brandNames = [...new Set((productBrands || []).map(r => r.brand).filter(Boolean))]

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

  // Calculate max trade-in value across all products
  const maxTradeValue = products.reduce((max, p) => {
    const val = calculateUpToValue(p)
    return val > max ? val : max
  }, 0)

  // Fetch brand logo when brand is selected
  let brandImg = null
  if (brand) {
    const { data: brandRow } = await supabaseAdmin
      .from('brands')
      .select('img')
      .eq('name', brand)
      .single()
    brandImg = brandRow?.img || null
  }

  // Sort products: numeric titles first, then Z-A
  const sortedProducts = [...products].sort((a, b) => {
    const ta = a.title || '', tb = b.title || ''
    const na = /\d/.test(ta), nb = /\d/.test(tb)
    if (na && !nb) return -1
    if (!na && nb) return 1
    return tb.localeCompare(ta, undefined, { numeric: true })
  })

  // Auto-skip logic
  const autoSkip = {}
  if (categoryName && brands.length === 1 && !brand) {
    autoSkip.brand = brands[0].name
  }

  // Build breadcrumb items for structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  const breadcrumbItems = [
    { name: 'Trade-In', url: `${baseUrl}/trade` },
    { name: 'Browse', url: `${baseUrl}/trade/browse` },
  ]
  if (categoryName && categorySlug) {
    breadcrumbItems.push({ name: categoryName, url: `${baseUrl}/trade/browse/${categorySlug}` })
  }
  if (brand && categorySlug) {
    breadcrumbItems.push({ name: brand, url: `${baseUrl}/trade/browse/${categorySlug}/${encodeURIComponent(brand)}` })
  }

  // Build ItemList structured data for products
  let itemListSchema = null
  if (sortedProducts.length > 0) {
    itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Trade in ${brand} ${categoryName}`,
      numberOfItems: sortedProducts.length,
      itemListElement: sortedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          image: product.imgs?.[0],
          url: `${baseUrl}/trade/product/${product.id}`,
          brand: { '@type': 'Brand', name: product.brand },
          category: product.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.base_price?.toString() || '0',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    }
  }

  return (
    <div className="min-h-screen">
      <BreadcrumbStructuredData items={breadcrumbItems} />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-2 py-4 sm:py-8 sm:px-4">
        {/* Banner - server rendered */}
        {categoryData && (
          <div className="relative overflow-hidden rounded-2xl bg-muted/60 border border-border mb-6">
            <div className="flex items-center gap-4 sm:gap-6 px-5 sm:px-8 py-4 sm:py-5">
              {(brand ? brandImg : categoryData.img) && (
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 shrink-0">
                  <Image
                    src={brand ? brandImg : categoryData.img}
                    alt={brand || categoryName}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                  {brand
                    ? t('bannerBrandTitle', { brand, category: categoryName })
                    : categoryData.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {brand && maxTradeValue > 0
                    ? t('bannerBrandSubtitle', { value: maxTradeValue.toFixed(0) })
                    : categoryData.description || t('subtitle')}
                </p>
              </div>
              {brand && maxTradeValue > 0 && (
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <span className="text-xs text-muted-foreground">{t('upTo')}</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${maxTradeValue.toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client component: breadcrumbs + filters */}
        <TradeBrowseSteps
          categoryName={categoryName}
          categorySlug={categorySlug}
          brand={brand}
          seriesList={seriesList}
          autoSkip={autoSkip}
        >
          {/* Brand grid - server rendered */}
          {categoryName && !brand && (
            <section>
              <h2 className="text-xl font-bold mb-6">{t('selectBrand')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {brands.map((b) => (
                  <TransitionLink
                    key={b.name}
                    href={`/trade/browse/${categorySlug}/${encodeURIComponent(b.name)}`}
                    className="group flex flex-col items-center rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 p-4 sm:p-6 gap-3 w-full"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center">
                      {b.img ? (
                        <Image
                          src={b.img}
                          alt={b.name}
                          width={80}
                          height={80}
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xl font-bold text-muted-foreground">
                            {b.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors text-center">
                      {b.name}
                    </span>
                  </TransitionLink>
                ))}
              </div>
              {brands.length === 0 && (
                <p className="text-muted-foreground text-center py-8">{t('noProductsFound')}</p>
              )}
            </section>
          )}

          {/* Product grid - server rendered with data attributes for client filtering */}
          {categoryName && brand && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('selectModel')}</h2>
                <span className="text-sm text-muted-foreground">
                  {t('devicesFound', { count: sortedProducts.length })}
                </span>
              </div>

              {sortedProducts.length > 0 ? (
                <div
                  id="trade-product-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4"
                >
                  {sortedProducts.map((product) => {
                    const upToPrice = calculateUpToValue(product)
                    return (
                      <div
                        key={product.id}
                        data-product-card
                        data-title={product.title}
                        data-series={product.series || ''}
                      >
                        <TransitionLink href={`/trade/product/${product.id}`} className="block group h-full">
                          <div className="relative flex flex-row sm:flex-col overflow-hidden rounded-2xl bg-card border border-border h-full hover:border-primary/50 hover:shadow-lg transition-all duration-200">
                            <div className="relative p-0 sm:p-0">
                              <div className="relative w-32 sm:w-full aspect-square border-b p-4">
                                {product.imgs && product.imgs.length > 0 && (
                                  <div className="relative w-full h-full p-3 sm:p-4 group-hover:scale-105 transition-transform duration-200">
                                    <Image
                                      src={product.imgs[0]}
                                      alt={product.title}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                                  ${upToPrice.toFixed(0)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 sm:flex-1 px-3 sm:px-4 sm:pb-2 space-y-2 sm:space-y-3 bg-background">
                              <div className="pt-4">
                                <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {product.title}
                                </h3>
                              </div>
                              <div className="flex flex-col sm:h-auto sm:flex-row items-start pb-4">
                                <span className="text-xs text-muted-foreground pr-2">
                                  {t('upTo')}
                                </span>
                                <div>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-md">
                                    ${upToPrice.toFixed(2).split('.')[0]}
                                  </span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                    .{upToPrice.toFixed(2).split('.')[1]}
                                  </span>
                                </div>
                                <div className='flex-1'/>
                                <div className="text-sm text-muted-foreground flex items-center gap-0.5 sm:pl-2">
                                  <Eye className="h-3 w-3" />{product.views}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TransitionLink>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-foreground mb-1">{t('noProductsFound')}</p>
                  <p className="text-sm text-muted-foreground">{t('noProductsHint')}</p>
                </div>
              )}
            </section>
          )}
        </TradeBrowseSteps>
      </div>
    </div>
  )
}
