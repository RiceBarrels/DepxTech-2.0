import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
import TradeHero from '@/components/trade/TradeHero'
import CategoryGrid from '@/components/trade/CategoryGrid'
import { TradeTrustIndicators, TradeValueProposition } from '@/components/trade/TradeTrustIndicators'
import { TradeProductCard } from '@/components/trade/TradeCards'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Package, Truck, CreditCard } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('tradeTitle'),
    description: t('tradeDescription'),
    openGraph: { title: t('tradeTitle'), description: t('tradeDescription'), type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function TradePage() {
  const t = await getTranslations('trade')

  // Fetch featured/popular products
  const { data: featured } = await supabaseAdmin
    .from('tradable_products')
    .select('id, title, base_price, imgs, des, brand, category')
    .order('views', { ascending: false })
    .limit(6)

  const featuredProducts = featured || []

  const steps = [
    { icon: Package, step: 1, title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
    { icon: Truck, step: 2, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
    { icon: CreditCard, step: 3, title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
  ]

  return (
    <div className="flex flex-col items-center">
      <TradeHero />
      <CategoryGrid />

      {/* Featured Devices */}
      {featuredProducts.length > 0 && (
        <section className="w-full max-w-7xl py-12 sm:py-16 px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">{t('featured.title')}</h2>
            <TransitionLink href="/trade/browse">
              <Button variant="ghost" size="sm">{t('featured.viewAll')}</Button>
            </TransitionLink>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product, i) => (
              <TradeProductCard
                key={product.id}
                product={product}
                href={`/trade/product/${product.id}`}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="w-full max-w-7xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl font-bold text-center text-foreground mb-10">{t('howItWorks.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {step}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="w-full max-w-7xl px-4 pb-6">
        <TradeTrustIndicators />
      </section>

      {/* Value Proposition */}
      <section className="w-full max-w-7xl px-4 pb-6">
        <TradeValueProposition />
      </section>

      {/* CTA */}
      <section className="w-full max-w-7xl px-4 pb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-muted/40 rounded-xl">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{t('cta.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('cta.description')}</p>
          </div>
          <TransitionLink href="/trade/browse">
            <Button size="lg">{t('cta.browseAll')}</Button>
          </TransitionLink>
        </div>
      </section>
    </div>
  )
}
