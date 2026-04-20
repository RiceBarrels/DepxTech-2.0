import { HomeHero } from '@/components/home/HomeHero'
import { HomeBanner } from '@/components/home/HomeBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { PopularTradeIns } from '@/components/home/PopularTradeIns'
import { Testimonials } from '@/components/home/Testimonials'
import { ImpactStats } from '@/components/home/ImpactStats'
import { BrandMarquee } from '@/components/home/BrandMarquee'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, { titleKey: 'homeTitle', descKey: 'homeDescription', path: '' })
}

function SectionDivider() {
  return <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
}

// Server component for the homepage
export default function HomePage() {
  return (
    <main className="bg-background">
      {/* <div className='bg-background sticky top-0 z-50'>
        <div className="text-2xl font-bold px-4 pt-6 pb-0">Home Page</div>
        <div className="text-base text-muted-foreground px-4 pb-4 shadow-[0_6px_12px_0_var(--background)]">DepxTech - Trade-In & Resale Platform</div>
      </div> */}
      {/* Promotional Banner */}
      <HomeBanner />

      <SectionDivider />

      {/* Category Section */}
      <CategoryGrid />

      <SectionDivider />

      {/* Popular Trade-In Devices */}
      <PopularTradeIns />

      <SectionDivider />

      {/* How it Works */}
      <HowItWorks />

      <SectionDivider />

      {/* Why Choose Us */}
      <WhyChooseUs />

      <SectionDivider />

      {/* Customer Testimonials */}
      <Testimonials />

      <SectionDivider />

      {/* Environmental Impact Stats */}
      <ImpactStats />

      {/* Brand Marquee */}
      <BrandMarquee />

      <SectionDivider />

      {/* Newsletter CTA */}
      <NewsletterSection />
    </main>
  )
}
