import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import TradeProductPageClient from './page.client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, DollarSignIcon } from 'lucide-react'
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
      return {
        title: 'Product Not Found | DepxTech',
      }
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
    return {
      title: 'Product | DepxTech',
    }
  }
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

  // Increment views
  await supabaseAdmin
    .from('tradable_products')
    .update({ views: (product.views || 0) + 1 })
    .eq('id', id)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const conditions = [
    {
      key: 'new',
      label: 'New',
      price: product.new_price,
      definition: product.new_def,
      badge: 'default',
      badgeColor: 'bg-green-600'
    },
    {
      key: 'good',
      label: 'Good',
      price: product.good_price,
      definition: product.good_def,
      badge: 'secondary',
      badgeColor: 'bg-blue-600'
    },
    {
      key: 'okay',
      label: 'Okay',
      price: product.okay_price,
      definition: product.okay_def,
      badge: 'outline',
      badgeColor: 'bg-yellow-600'
    },
    {
      key: 'bad',
      label: 'Bad',
      price: product.bad_price,
      definition: product.bad_def,
      badge: 'outline',
      badgeColor: 'bg-orange-600'
    },
    {
      key: 'broken',
      label: 'Broken',
      price: product.broken_price,
      definition: product.broken_def,
      badge: 'destructive',
      badgeColor: 'bg-red-600'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Google Store Style */}
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
                <p className="text-xl text-muted-foreground mb-6">
                  {product.category}
                </p>
              </div>

              {product.des && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.des}
                  </p>
                </div>
              )}

              {/* Trust Badges - Back Market Style */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800">
                  <Badge className="bg-green-600">Best Price</Badge>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
                  <Badge className="bg-blue-600">Secure</Badge>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Data Wiped</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950/20 rounded-full border border-purple-200 dark:border-purple-800">
                  <Badge className="bg-purple-600">Fast</Badge>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-400">24hr Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Condition Prices - Back Market Style */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Trade-In Values by Condition</h2>
              <p className="text-muted-foreground mb-6">
                Select the condition that best matches your device to see your estimated trade-in value
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conditions.map((condition) => (
                <Card 
                  key={condition.key}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge 
                        variant={condition.badge}
                        className={`${condition.badgeColor} text-white text-sm px-3 py-1`}
                      >
                        {condition.label}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Up to</p>
                        <p className="text-2xl font-bold flex items-center justify-end gap-1">
                          {formatCurrency(condition.price)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {condition.definition}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">How it works</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <span>Select your device condition above</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <span>Fill out the quote form with your contact information</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <span>We'll review and contact you within 24 hours</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">4.</span>
                    <span>Ship your device (we cover shipping costs)</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-primary">5.</span>
                    <span>Get paid after we verify the condition</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Get Quote Form - Sticky Sidebar */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <TradeProductPageClient product={product} conditions={conditions} />
          </div>
        </div>
      </div>
    </div>
  )
}
