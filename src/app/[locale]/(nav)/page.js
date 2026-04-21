import { HomeBanner } from '@/components/home/HomeBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { PopularTradeIns } from '@/components/home/PopularTradeIns'
import { Testimonials } from '@/components/home/Testimonials'
import { ImpactStats } from '@/components/home/ImpactStats'
import { BrandMarquee } from '@/components/home/BrandMarquee'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { MacbookShowcase } from '@/components/home/MacbookShowcase'
import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, { titleKey: 'homeTitle', descKey: 'homeDescription', path: '' })
}

export default function HomePage() {
  return (
    <main className="bg-background">
      <HomeBanner />

      <CategoryGrid />

      <MacbookShowcase />

      <PopularTradeIns />

      <HowItWorks />

      <WhyChooseUs />

      <ImpactStats />

      <Testimonials />

      <BrandMarquee />

      <NewsletterSection />
    </main>
  )
}
