import { ScrollStagger, ScrollReveal, ScrollCounter } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

export async function ImpactStats() {
  const t = await getTranslations('home.impact')

  const stats = [
    { value: 5000, label: t('stat1Label'), suffix: '+' },
    { value: 12000, label: t('stat2Label'), suffix: ' kg' },
    { value: 50000, label: t('stat3Label'), suffix: ' L' },
    { value: 99, label: t('stat4Label'), suffix: '%' },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="bottom" className="max-w-2xl mb-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
            {t('heading')}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            {t('subheading')}
          </p>
        </ScrollReveal>

        <ScrollStagger staggerChildren={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-t border-slate-200 dark:border-slate-800 pt-10">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} animation="bottom">
              <div className="flex flex-col gap-1.5">
                <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  <ScrollCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
