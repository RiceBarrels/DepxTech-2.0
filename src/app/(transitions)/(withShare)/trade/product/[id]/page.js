import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import TradeProductPageClient from './page.client'
import { Badge } from '@/components/ui/badge'
import { Shield, Truck, Clock, DollarSign } from 'lucide-react'
import Image from 'next/image'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Product Image */}
            <div className="order-2 lg:order-1">
              {product.imgs && product.imgs.length > 0 && (
                <div className="relative w-full max-w-md mx-auto">
                  <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700/50 p-6 lg:p-8">
                    <div className="relative w-full h-full">
                      <Image
                        src={product.imgs[0]}
                        alt={product.title}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="order-1 lg:order-2 space-y-5">
              <div>
                <Badge variant="secondary" className="mb-3 text-xs">
                  {product.brand} • {product.series}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                  {product.title}
                </h1>
                {product.des && (
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{product.des}</p>
                )}
              </div>

              {/* Price Display */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">Trade-in up to</span>
                </div>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${depreciatedPrice.toFixed(2)}
                </p>
                {depreciation.multiplier < 100 && (
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">
                    {depreciation.label}
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Best Price</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Shipping</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Free</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Payment</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">24 Hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Data Wipe</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Certified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Questionnaire */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
