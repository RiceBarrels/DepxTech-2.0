import { HomeHero } from '@/components/home/HomeHero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { NewsletterSection } from '@/components/home/NewsletterSection'


// Metadata for SEO
export const metadata = {
  title: 'DepxTech - Trade-in Your Electronics for Cash',
  description: 'Turn your old electronics into instant cash. Fast quotes, free shipping, and high payouts guaranteed. The smarter way to recycle your tech.',
  keywords: 'trade-in, electronics, recycle, sell phone, sell laptop, sell tablet, cash for electronics, tech buyback, eco-friendly',
  openGraph: {
    title: 'DepxTech - Trade-in Your Electronics for Cash',
    description: 'Turn your old electronics into instant cash. Fast quotes, free shipping, and high payouts guaranteed.',
    type: 'website',
    siteName: 'DepxTech'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DepxTech - Trade-in Your Electronics for Cash',
    description: 'Turn your old electronics into instant cash. Fast quotes, free shipping, and high payouts guaranteed.'
  }
}

// Server component for the homepage
export default function HomePage() {
  return (
    <main className="bg-background">
      {/* Hero Section with Aceternity Spotlight */}
      <HomeHero />

      {/* Category Section with Hover Effects */}
      <CategoryGrid />

      {/* How it Works Section with Animations */}
      <HowItWorks />

      {/* Why Choose Us with Animated Cards */}
      <WhyChooseUs />

      {/* Newsletter CTA with Animations */}
      <NewsletterSection />
    </main>
  )
}
