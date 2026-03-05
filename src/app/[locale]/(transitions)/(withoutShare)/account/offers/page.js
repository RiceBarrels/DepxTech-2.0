import { supabaseAdmin } from '@/lib/supabase-admin'
import OffersPageClient from './page.client'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('offersTitle'),
    description: t('offersDescription'),
    openGraph: { title: t('offersTitle'), description: t('offersDescription'), type: 'website' },
    robots: { index: true, follow: true },
  }
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
