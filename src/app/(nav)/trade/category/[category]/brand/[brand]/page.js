import { supabaseAdmin } from '@/lib/supabase-admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { TransitionLink } from '@/components/ui/pageTransitions'

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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <TransitionLink href={`/trade/category/${encodeURIComponent(category)}`}>
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Brands
            </Button>
          </TransitionLink>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Series</h1>
          <p className="text-xl text-muted-foreground">
            Choose the series of your {brand} {category}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Pick Series</CardTitle>
            <CardDescription>
              Select the product line of your {brand} {category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uniqueSeries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueSeries.map((seriesName) => (
                  <TransitionLink 
                    key={seriesName} 
                    href={`/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}/series/${encodeURIComponent(seriesName)}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6 flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{seriesName}</h3>
                        <ArrowRightIcon className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </TransitionLink>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No series available for this brand.</p>
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
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Pick Series</h3>
            <p className="text-sm text-muted-foreground">Choose the product line</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-muted-foreground">4</span>
            </div>
            <h3 className="font-semibold mb-2">Select Model</h3>
            <p className="text-sm text-muted-foreground">Pick your specific device</p>
          </div>
        </div>
      </div>
    </div>
  )
}