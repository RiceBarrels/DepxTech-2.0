import { fetchRecommendationsServer } from '@/lib/fetch-recommends'
import HomePageClient from './page.client'

// Server component for SEO and initial data loading
export default async function HomePage() {
  // Fetch initial recommendations data on the server for SEO
  const initialRecommendations = await fetchRecommendationsServer({
    limit: 12,
    categories: []
  })

  return (
    <HomePageClient 
      initialRecommendations={initialRecommendations.products} 
    />
  )
}

export const metadata = {
  title: 'DepxTech - Premium Electronics Store',
  description: 'Latest tech, best prices, premium quality electronics. Discover smartphones, laptops, headphones, gaming gear, smart home devices and accessories.',
  keywords: 'electronics, technology, smartphones, laptops, headphones, gaming, smart home, accessories, tech store',
  openGraph: {
    title: 'DepxTech - Premium Electronics Store',
    description: 'Latest tech, best prices, premium quality electronics',
    type: 'website',
    siteName: 'DepxTech'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DepxTech - Premium Electronics Store',
    description: 'Latest tech, best prices, premium quality electronics'
  }
}