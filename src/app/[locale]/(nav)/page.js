import { HomeHero } from '@/components/home/HomeHero'
import { HomeBanner } from '@/components/home/HomeBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    openGraph: { title: t('homeTitle'), description: t('homeDescription'), type: 'website', siteName: 'DepxTech' },
    twitter: { card: 'summary_large_image', title: t('homeTitle'), description: t('homeDescription') },
  }
}

function SectionDivider() {
  return <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
}

// Server component for the homepage
export default function HomePage() {
  return (
    <main className="bg-background">
      {/* Promotional Banner */}
      <HomeBanner />

      <SectionDivider />

      {/* Category Section with Hover Effects */}
      <CategoryGrid />

      <SectionDivider />

      {/* How it Works Section with Animations */}
      <HowItWorks />

      <SectionDivider />

      {/* Why Choose Us with Animated Cards */}
      <WhyChooseUs />

      <SectionDivider />

      {/* Newsletter CTA with Animations */}
      <NewsletterSection />
    </main>
  )
}
