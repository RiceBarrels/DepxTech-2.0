import { supabaseAdmin } from '@/lib/supabase-admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, ArrowRightIcon, DollarSignIcon } from 'lucide-react'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'

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
    .order('title', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <TransitionLink href={`/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}`}>
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Series
            </Button>
          </TransitionLink>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Your Device</h1>
          <p className="text-xl text-muted-foreground">
            Choose your {brand} {series} model
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Select Model</CardTitle>
            <CardDescription>
              Pick your specific {brand} {series} device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <TransitionLink 
                    key={product.id} 
                    href={`/trade/product/${product.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-6">
                        {product.imgs && product.imgs.length > 0 && (
                          <div className="w-full h-48 mb-4 relative">
                            <Image
                              src={product.imgs[0]}
                              alt={product.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                        {product.des && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {product.des}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Trade-in value:</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="default" className="bg-green-600">
                              New
                            </Badge>
                            <span className="font-semibold flex items-center">
                              <DollarSignIcon className="w-4 h-4" />
                              {product.new_price}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">
                              Good
                            </Badge>
                            <span className="font-semibold flex items-center">
                              <DollarSignIcon className="w-4 h-4" />
                              {product.good_price}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-end">
                          <span className="text-sm text-primary flex items-center">
                            Get Quote
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </TransitionLink>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No products available for this series.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-muted-foreground">✓</span>
            </div>
            <h3 className="font-semibold mb-2">Select Category</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-muted-foreground">✓</span>
            </div>
            <h3 className="font-semibold mb-2">Choose Brand</h3>
            <p className="text-sm text-muted-foreground">{brand}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-muted-foreground">✓</span>
            </div>
            <h3 className="font-semibold mb-2">Pick Series</h3>
            <p className="text-sm text-muted-foreground">{series}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-primary">4</span>
            </div>
            <h3 className="font-semibold mb-2">Select Model</h3>
            <p className="text-sm text-muted-foreground">Pick your specific device</p>
          </div>
        </div>
      </div>
    </div>
  )
}