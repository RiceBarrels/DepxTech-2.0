import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'

export default async function CategoryBrandPage({ params }) {
  const category = decodeURIComponent(params.category)
  
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/trade">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Brand</h1>
          <p className="text-xl text-muted-foreground">
            Choose the brand of your {category}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Choose Brand</CardTitle>
            <CardDescription>
              Select the manufacturer of your {category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uniqueBrands.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {uniqueBrands.map((item) => (
                  <Link 
                    key={item.brand} 
                    href={`/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(item.brand)}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        {item.brand_img ? (
                          <div className="w-20 h-20 mb-4 relative">
                            <Image
                              src={item.brand_img}
                              alt={item.brand}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 mb-4 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-muted-foreground">
                              {item.brand.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h3 className="font-semibold">{item.brand}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No brands available for this category.</p>
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
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Choose Brand</h3>
            <p className="text-sm text-muted-foreground">Select the manufacturer</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-muted-foreground">3</span>
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