import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import TradeProductPageClient from './page.client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'

export async function generateMetadata({ params }) {
  const { id } = await params

  try {
    const { data: product } = await supabaseAdmin
      .from('tradable_products')
      .select('*')
      .eq('id', id)
      .single()

    if (!product) {
      return { title: 'Product Not Found | DepxTech' }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

    return {
      title: `Trade In ${product.title} | DepxTech`,
      description: `Get a quote for trading in your ${product.title}. ${product.des || ''}`,
      keywords: [`trade in ${product.title}`, product.brand, product.series, product.category, 'depxtech', 'trade in'],
      openGraph: {
        title: `Trade In ${product.title} | DepxTech`,
        description: `Get a quote for trading in your ${product.title}.`,
        type: 'website',
        url: `${baseUrl}/trade/product/${id}`,
        images: product.imgs && product.imgs.length > 0 ? [product.imgs[0]] : [],
      },
      alternates: {
        canonical: `${baseUrl}/trade/product/${id}`,
      },
    }
  } catch (error) {
    return { title: 'Product | DepxTech' }
  }
}

// Calculate depreciation based on admin-set depreciation rate
function calculateDepreciation(depreciationRate) {
  const rate = Number(depreciationRate) || 0
  const multiplier = 100 - rate

  let label = 'Current'
  if (rate >= 50) label = 'Significant Depreciation'
  else if (rate >= 30) label = 'Moderate Depreciation'
  else if (rate >= 10) label = 'Minor Depreciation'
  else if (rate > 0) label = 'Like New'

  return { multiplier, label, rate }
}

export default async function TradeProductPage({ params }) {
  const { id } = await params

  // Fetch product data
  const { data: product, error } = await supabaseAdmin
    .from('tradable_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Use product-specific questions from the questions column
  const productQuestions = product.questions || []

  // Increment views
  await supabaseAdmin
    .from('tradable_products')
    .update({ views: (product.views || 0) + 1 })
    .eq('id', id)

  // Calculate base price with depreciation
  const basePrice = Number(product.base_price) || 0
  const depreciation = calculateDepreciation(product.depreciation_rate)
  const depreciatedPrice = basePrice * (depreciation.multiplier / 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted/50 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <TransitionLink
            href={`/trade/category/${encodeURIComponent(product.category)}/brand/${encodeURIComponent(product.brand)}/series/${encodeURIComponent(product.series)}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to {product.series}
          </TransitionLink>

          {/* Product Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <div className="order-2 lg:order-1">
              {product.imgs && product.imgs.length > 0 && (
                <div className="w-full aspect-square max-w-lg mx-auto relative rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 p-8">
                  <Image
                    src={product.imgs[0]}
                    alt={product.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="order-1 lg:order-2 space-y-6">
              <div>
                <Badge variant="outline" className="mb-4">
                  {product.brand} {product.series}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {product.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {product.category}
                </p>

                {/* Price Display */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1">Trade-in value up to</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    ${depreciatedPrice.toFixed(2)}
                  </p>
                  {depreciation.multiplier < 100 && (
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                      {depreciation.label} • {depreciation.multiplier}% of original value
                    </p>
                  )}
                </div>
              </div>

              {product.des && (
                <p className="text-muted-foreground leading-relaxed">{product.des}</p>
              )}

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800">
                  <Badge className="bg-green-600">Best Price</Badge>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
                  <Badge className="bg-blue-600">Free</Badge>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Questionnaire */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TradeProductPageClient
          product={product}
          questions={productQuestions}
          basePrice={depreciatedPrice}
          minPrice={product.min_price ? Number(product.min_price) : null}
          depreciation={depreciation}
        />
      </div>
    </div>
  )
}
