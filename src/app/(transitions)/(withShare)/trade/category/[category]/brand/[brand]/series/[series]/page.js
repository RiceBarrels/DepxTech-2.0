import { supabaseAdmin } from '@/lib/supabase-admin'
import { TradeProgressStepper } from '@/components/trade/TradeProgressStepper'
import { TradePageHeader } from '@/components/trade/TradePageHeader'
import { TradeProductCard } from '@/components/trade/TradeCards'
import { TradeEmptyState } from '@/components/trade/TradeEmptyState'
import { TradeTrustIndicators, TradeValueProposition } from '@/components/trade/TradeTrustIndicators'

export async function generateMetadata({ params }) {
  const { category: categoryParam, brand: brandParam, series: seriesParam } = await params
  const category = decodeURIComponent(categoryParam)
  const brand = decodeURIComponent(brandParam)
  const series = decodeURIComponent(seriesParam)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  return {
    title: `Trade In ${brand} ${series} ${category} | DepxTech`,
    description: `Trade in your ${brand} ${series} ${category} at DepxTech. Get instant quotes for your device. Select your specific model and get the best trade-in value.`,
    keywords: [`trade in ${brand} ${series}`, brand, series, category, 'depxtech', 'trade in'],
    openGraph: {
      title: `Trade In ${brand} ${series} ${category} | DepxTech`,
      description: `Trade in your ${brand} ${series} ${category} at DepxTech. Get instant quotes for your device.`,
      type: 'website',
      url: `${baseUrl}/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}/series/${encodeURIComponent(series)}`,
    },
    alternates: {
      canonical: `${baseUrl}/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}/series/${encodeURIComponent(series)}`,
    },
  }
}

export default async function SeriesProductsPage({ params }) {
  const { category: categoryParam, brand: brandParam, series: seriesParam } = await params
  const category = decodeURIComponent(categoryParam)
  const brand = decodeURIComponent(brandParam)
  const series = decodeURIComponent(seriesParam)

  // Fetch products for this category, brand, and series
  const { data: products, error } = await supabaseAdmin
    .from('tradable_products')
    .select('*')
    .eq('category', category)
    .eq('brand', brand)
    .eq('series', series)
    .order('base_price', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
  }

  const productCount = products?.length || 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Stepper */}
        <div className="mb-12">
          <TradeProgressStepper
            currentStep={4}
            completedData={{ category, brand, series }}
          />
        </div>

        {/* Page Header */}
        <TradePageHeader
          step={4}
          icon="smartphone"
          title="Select Your Device"
          subtitle={`Choose your ${brand} ${series} model to get an instant quote`}
        />

        {/* Products count */}
        {productCount > 0 && (
          <p className="text-center text-slate-500 mt-4 mb-8">
            {productCount} model{productCount > 1 ? 's' : ''} available
          </p>
        )}

        {/* Products Grid */}
        <div className="mt-8">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product, index) => (
                <TradeProductCard
                  key={product.id}
                  product={product}
                  href={`/trade/product/${product.id}`}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <TradeEmptyState
              icon="smartphone"
              message="No products available for this series."
            />
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16">
          <TradeTrustIndicators />
        </div>

        {/* Value Proposition */}
        <div className="mt-8">
          <TradeValueProposition />
        </div>
      </div>
    </div>
  )
}
