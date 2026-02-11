import { supabaseAdmin } from '@/lib/supabase-admin'
import { TradeProgressStepper } from '@/components/trade/TradeProgressStepper'
import { TradePageHeader } from '@/components/trade/TradePageHeader'
import { TradeBrandCard } from '@/components/trade/TradeCards'
import { TradeEmptyState } from '@/components/trade/TradeEmptyState'

export async function generateMetadata({ params }) {
  const { category: categoryParam } = await params
  const category = decodeURIComponent(categoryParam)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  return {
    title: `Trade In ${category} | DepxTech`,
    description: `Trade in your ${category} at DepxTech. Get instant quotes for your device. Choose from ${category} brands and get the best trade-in value.`,
    keywords: [`trade in ${category}`, category, 'depxtech', 'trade in', 'electronics trade in'],
    openGraph: {
      title: `Trade In ${category} | DepxTech`,
      description: `Trade in your ${category} at DepxTech. Get instant quotes for your device.`,
      type: 'website',
      url: `${baseUrl}/trade/category/${encodeURIComponent(category)}`,
    },
    alternates: {
      canonical: `${baseUrl}/trade/category/${encodeURIComponent(category)}`,
    },
  }
}

export default async function CategoryBrandPage({ params }) {
  const { category: categoryParam } = await params
  const category = decodeURIComponent(categoryParam)

  // Fetch distinct brands for this category
  const { data: brands, error } = await supabaseAdmin
    .from('tradable_products')
    .select('brand, brand_img')
    .eq('category', category)
    .order('brand', { ascending: true })

  if (error) {
    console.error('Error fetching brands:', error)
  }

  // Get unique brands with their images
  const uniqueBrands = brands?.reduce((acc, item) => {
    if (!acc.find(b => b.brand === item.brand)) {
      acc.push({ brand: item.brand, brand_img: item.brand_img })
    }
    return acc
  }, []) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Stepper */}
          <div className="mb-12">
            <TradeProgressStepper
              currentStep={2}
              completedData={{ category }}
            />
          </div>

          {/* Page Header */}
          <TradePageHeader
            step={2}
            icon="building"
            title="Choose Your Brand"
            subtitle={`Select the manufacturer of your ${category} to continue`}
          />

          {/* Brands Grid */}
          <div className="mt-12">
            {uniqueBrands.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {uniqueBrands.map((item, index) => (
                  <TradeBrandCard
                    key={item.brand}
                    brand={item.brand}
                    brandImg={item.brand_img}
                    href={`/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(item.brand)}`}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <TradeEmptyState
                icon="building"
                message="No brands available for this category."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
