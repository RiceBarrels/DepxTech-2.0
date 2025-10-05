import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, DollarSignIcon, CheckCircleIcon, InfoIcon } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function TradeInProductPage({ params }) {
  const { id } = params
  
  // Increment views on the server side
  try {
    // Get current views
    const { data: currentProduct } = await supabaseAdmin
      .from('tradable_products')
      .select('views')
      .eq('id', id)
      .single()
    
    if (currentProduct) {
      // Increment views
      await supabaseAdmin
        .from('tradable_products')
        .update({ views: (currentProduct.views || 0) + 1 })
        .eq('id', id)
    }
  } catch (error) {
    console.error('Error incrementing views:', error)
  }
  
  // Fetch the product
  const { data: product, error } = await supabaseAdmin
    .from('tradable_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  const conditions = [
    { 
      name: 'New', 
      price: product.new_price, 
      definition: product.new_def,
      color: 'bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    { 
      name: 'Good', 
      price: product.good_price, 
      definition: product.good_def,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'Okay', 
      price: product.okay_price, 
      definition: product.okay_def,
      color: 'bg-yellow-600',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },
    { 
      name: 'Bad', 
      price: product.bad_price, 
      definition: product.bad_def,
      color: 'bg-orange-600',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50'
    },
    { 
      name: 'Broken', 
      price: product.broken_price, 
      definition: product.broken_def,
      color: 'bg-red-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50'
    },
  ]

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Information */}
          <div>
            {product.imgs && product.imgs.length > 0 && (
              <div className="w-full h-96 mb-6 relative">
                <Image
                  src={product.imgs[0]}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            {product.des && (
              <p className="text-muted-foreground mb-4">{product.des}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant="outline">{product.brand}</Badge>
              <Badge variant="outline">{product.series}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Views: {product.views || 0}</p>
              <p>Total Trades: {product.trades || 0}</p>
            </div>
          </div>

          {/* Trade-in Values */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Trade-in Values</CardTitle>
                <CardDescription>
                  Select the condition that best matches your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {conditions.map((condition) => (
                  <div key={condition.name} className={`p-4 rounded-lg border ${condition.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={condition.color}>
                          {condition.name}
                        </Badge>
                        <span className={`text-2xl font-bold ${condition.textColor}`}>
                          ${condition.price}
                        </span>
                      </div>
                      <Link href={`/trade/submit?product=${id}&condition=${condition.name.toLowerCase()}`}>
                        <Button size="sm">
                          Select
                        </Button>
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {condition.definition}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">1. Select Condition</p>
                      <p className="text-sm text-muted-foreground">
                        Choose the condition that best matches your device
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">2. Get Instant Quote</p>
                      <p className="text-sm text-muted-foreground">
                        Receive your trade-in value immediately
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">3. Ship Your Device</p>
                      <p className="text-sm text-muted-foreground">
                        We'll send you a prepaid shipping label
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">4. Get Paid</p>
                      <p className="text-sm text-muted-foreground">
                        Receive payment after inspection
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }) {
  const { data: product } = await supabaseAdmin
    .from('tradable_products')
    .select('title, brand, series, category')
    .eq('id', params.id)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `Trade In ${product.title} - ${product.brand} ${product.series}`,
    description: `Get instant cash for your ${product.brand} ${product.series} ${product.title}. Trade in your ${product.category} today.`,
  }
}