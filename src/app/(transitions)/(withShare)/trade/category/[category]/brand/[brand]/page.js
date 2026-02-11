import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { TradeProgressStepper } from '@/components/trade/TradeProgressStepper'
import { TradePageHeader } from '@/components/trade/TradePageHeader'
import { TradeSeriesCard } from '@/components/trade/TradeCards'
import { TradeEmptyState } from '@/components/trade/TradeEmptyState'

export async function generateMetadata({ params }) {
  const { category: categoryParam, brand: brandParam } = await params
  const category = decodeURIComponent(categoryParam)
  const brand = decodeURIComponent(brandParam)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  return {
    title: `Trade In ${brand} ${category} | DepxTech`,
    description: `Trade in your ${brand} ${category} at DepxTech. Get instant quotes for your ${brand} device. Choose your model and get the best trade-in value.`,
    keywords: [`trade in ${brand} ${category}`, brand, category, 'depxtech', 'trade in'],
    openGraph: {
      title: `Trade In ${brand} ${category} | DepxTech`,
      description: `Trade in your ${brand} ${category} at DepxTech. Get instant quotes for your device.`,
      type: 'website',
      url: `${baseUrl}/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}`,
    },
    alternates: {
      canonical: `${baseUrl}/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}`,
    },
  }
}

export default async function BrandSeriesPage({ params }) {
  const { category: categoryParam, brand: brandParam } = await params
  const category = decodeURIComponent(categoryParam)
  const brand = decodeURIComponent(brandParam)

  // Fetch distinct series for this category and brand
  const { data: series, error } = await supabaseAdmin
    .from('tradable_products')
    .select('series')
    .eq('category', category)
    .eq('brand', brand)
    .order('series', { ascending: true })

  if (error) {
    console.error('Error fetching series:', error)
  }

  // Get unique series
  const uniqueSeries = [...new Set(series?.map(item => item.series) || [])]

  // If only one series, skip directly to that series page
  if (uniqueSeries.length === 1) {
    redirect(`/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}/series/${encodeURIComponent(uniqueSeries[0])}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Stepper */}
          <div className="mb-12">
            <TradeProgressStepper
              currentStep={3}
              completedData={{ category, brand }}
            />
          </div>

          {/* Page Header */}
          <TradePageHeader
            step={3}
            icon="layout"
            title="Select Product Line"
            subtitle={`Choose the series of your ${brand} ${category}`}
          />

          {/* Series List */}
          <div className="mt-12">
            {uniqueSeries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uniqueSeries.map((seriesName, index) => (
                  <TradeSeriesCard
                    key={seriesName}
                    series={seriesName}
                    href={`/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}/series/${encodeURIComponent(seriesName)}`}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <TradeEmptyState
                icon="layout"
                message="No series available for this brand."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
