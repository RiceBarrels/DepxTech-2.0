import TradeSearch from './TradeSearch'
import { Leaf } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function TradeHero() {
  const t = await getTranslations('trade.hero')

  return (
    <section className="relative flex flex-col items-center justify-center gap-5 sm:gap-6 pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 max-w-3xl mx-auto text-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]" />

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
        <Leaf className="w-3 h-3" />
        {t('ecoBuyback')}
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
        {t('title')}
      </h1>

      <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
        {t('description')}
      </p>

      <div className="w-full max-w-xl mt-1">
        <TradeSearch variant="hero" />
      </div>
    </section>
  )
}
