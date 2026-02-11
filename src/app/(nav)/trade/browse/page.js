import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import TradeBrowseFilters from '@/components/trade/TradeBrowseFilters'
import { TradeProductCard } from '@/components/trade/TradeCards'
import TradeSearch from '@/components/trade/TradeSearch'
import { PackageSearch } from 'lucide-react'

export async function generateMetadata({ searchParams }) {
  const { category, brand, series } = await searchParams
  const parts = [brand, series, category].filter(Boolean)
  const title = parts.length > 0
    ? `Trade In ${parts.join(' ')} | DepxTech`
    : 'Browse Trade-In Devices | DepxTech'
  const description = parts.length > 0
    ? `Trade in your ${parts.join(' ')} at DepxTech. Get instant quotes and top payouts.`
    : 'Browse all trade-in eligible devices at DepxTech. Smartphones, laptops, tablets, GPUs and more.'

  return {
    title,
    description,
    robots: { index: true, follow: true },
  }
}

export default async function BrowsePage({ searchParams }) {
  const { category, brand, series, q } = await searchParams

  // Build product query
  let query = supabaseAdmin
    .from('tradable_products')
    .select('*')
    .order('base_price', { ascending: false })

  if (category) query = query.eq('category', category)
  if (brand) query = query.eq('brand', brand)
  if (series) query = query.eq('series', series)
  if (q) query = query.or(`title.ilike.%${q}%,brand.ilike.%${q}%,series.ilike.%${q}%`)

  const { data: products, error } = await query

  if (error) console.error('Browse fetch error:', error)

  const allProducts = products || []

  // Fetch filter options — categories always all, brands/series depend on selection
  const [catRes, brandRes, seriesRes] = await Promise.all([
    supabaseAdmin.from('tradable_products').select('category').order('category'),
    category
      ? supabaseAdmin.from('tradable_products').select('brand').eq('category', category).order('brand')
      : Promise.resolve({ data: [] }),
    category && brand
      ? supabaseAdmin.from('tradable_products').select('series').eq('category', category).eq('brand', brand).order('series')
      : Promise.resolve({ data: [] }),
  ])

  const categories = [...new Set((catRes.data || []).map(r => r.category))].sort()
  const brands = [...new Set((brandRes.data || []).map(r => r.brand))].sort()
  const seriesList = [...new Set((seriesRes.data || []).map(r => r.series))].sort()

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Browse Devices
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Find your device and get an instant trade-in quote.
          </p>
          <div className="max-w-md">
            <TradeSearch variant="default" />
          </div>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <TradeBrowseFilters
            categories={categories}
            brands={brands}
            seriesList={seriesList}
            totalCount={allProducts.length}
          />
        </Suspense>

        {/* Product Grid */}
        <div className="mt-8">
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allProducts.map((product, index) => (
                <TradeProductCard
                  key={product.id}
                  product={product}
                  href={`/trade/product/${product.id}`}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <PackageSearch className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">No devices found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your filters or search for a different device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
