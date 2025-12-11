import { supabaseAdmin } from '@/lib/supabase-admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TicketPercentIcon } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'Special Offers & Deals',
  description: 'Discover the latest deals, discounts, and special offers at DepxTech. Save on smartphones, laptops, headphones, gaming gear, and more electronics.',
  keywords: [
    'deals',
    'discounts',
    'special offers',
    'promotions',
    'coupons',
    'electronics deals',
    'depxtech',
    'sale',
  ],
  openGraph: {
    title: 'Special Offers & Deals | DepxTech',
    description: 'Discover the latest deals, discounts, and special offers at DepxTech.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function OffersPage() {
  // Fetch active offers
  const { data: offers, error } = await supabaseAdmin
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching offers:', error)
  }

  // Filter offers that are currently active based on dates
  const now = new Date()
  const activeOffers = (offers || []).filter(offer => {
    const startDate = offer.start_date ? new Date(offer.start_date) : null
    const endDate = offer.end_date ? new Date(offer.end_date) : null
    
    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    return true
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <TicketPercentIcon className="w-10 h-10" />
            Special Offers
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover our latest deals and promotions
          </p>
        </div>

        {activeOffers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <TicketPercentIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No active offers at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for exciting deals!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                {offer.image_url && (
                  <div className="w-full h-48 relative">
                    <Image
                      src={offer.image_url}
                      alt={offer.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex-1">{offer.title}</CardTitle>
                    <div className="flex flex-col items-end gap-1">
                      {offer.discount_percentage !== null && (
                        <Badge variant="default" className="bg-green-600 text-white text-lg px-3 py-1">
                          {offer.discount_percentage}% OFF
                        </Badge>
                      )}
                      {offer.discount_amount !== null && (
                        <Badge variant="default" className="bg-green-600 text-white text-lg px-3 py-1">
                          {formatCurrency(offer.discount_amount)} OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {offer.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {offer.code && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Promo Code:</p>
                        <p className="font-mono font-bold text-lg">{offer.code}</p>
                      </div>
                    )}
                    
                    {(offer.start_date || offer.end_date) && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {offer.start_date && (
                          <p>Starts: {formatDate(offer.start_date)}</p>
                        )}
                        {offer.end_date && (
                          <p>Ends: {formatDate(offer.end_date)}</p>
                        )}
                      </div>
                    )}

                    {(offer.min_purchase_amount || offer.max_discount_amount) && (
                      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                        {offer.min_purchase_amount && (
                          <p>Min. purchase: {formatCurrency(offer.min_purchase_amount)}</p>
                        )}
                        {offer.max_discount_amount && (
                          <p>Max. discount: {formatCurrency(offer.max_discount_amount)}</p>
                        )}
                      </div>
                    )}

                    {offer.applicable_categories && offer.applicable_categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {offer.applicable_categories.map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
