import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'
import { TransitionLink } from '../ui/pageTransitions'

const deviceData = [
  { key: 'device1', image: '/stockImg/iphone_17_pro_max.png', href: '/trade/browse/smartphones' },
  { key: 'device2', image: '/stockImg/macbook_pro.png', href: '/trade/browse/laptops' },
  { key: 'device3', image: '/stockImg/ipad_pro.png', href: '/trade/browse/tablets' },
  { key: 'device4', image: '/stockImg/apple_watch.png', href: '/trade/browse/wearables' },
]

export async function PopularTradeIns() {
  const t = await getTranslations('home.popularTradeIns')

  const devices = deviceData.map(d => ({
    ...d,
    name: t(`${d.key}Name`),
    price: t(`${d.key}Price`),
  }))

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-6">
          <ScrollReveal animation="left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{t('heading')}</h2>
            <p className="text-slate-500 mt-2">{t('subheading')}</p>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <TransitionLink
              href="/trade/browse"
              className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1 border-b border-slate-900/30 dark:border-white/30 pb-0.5 hover:border-slate-900 dark:hover:border-white transition-colors whitespace-nowrap"
            >
              {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </TransitionLink>
          </ScrollReveal>
        </div>

        {/* Devices — clean grid, no heavy cards */}
        <ScrollStagger staggerChildren={0.08} delayChildren={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {devices.map((device) => (
            <ScrollReveal key={device.key} animation="bottom">
              <TransitionLink href={device.href} className="group flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white dark:bg-slate-900">
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                      <Image
                        src={device.image}
                        alt={device.name}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {device.name}
                  </h3>
                  <p className="text-sm text-slate-500 tabular-nums">
                    {t('upTo')} <span className="text-slate-900 dark:text-white font-medium">{device.price}</span>
                  </p>
                </div>
              </TransitionLink>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
