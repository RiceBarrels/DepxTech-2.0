import { supabaseAdmin } from '@/lib/supabase-admin'
import OffersPageClient from './page.client'

export const metadata = {
  title: 'Special Offers & Deals',
  description: 'Discover the latest deals, discounts, and special offers at DepxTech. Save on smartphones, laptops, headphones, gaming gear, and more electronics.',
  keywords: [
    'deals',
    'discounts',
    'special offers',
    'promotions',
    'offers',
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

  return <OffersPageClient initialOffers={activeOffers} />
}
