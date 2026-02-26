import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

const deviceData = [
  { key: 'device1', image: '/stockImg/iphone_17_pro_max.png', href: '/trade/browse?category=smartphones' },
  { key: 'device2', image: '/stockImg/macbook_pro.png', href: '/trade/browse?category=laptops' },
  { key: 'device3', image: '/stockImg/ipad_pro.png', href: '/trade/browse?category=tablets' },
  { key: 'device4', image: '/stockImg/apple_watch.png', href: '/trade/browse?category=wearables' },
]

export async function PopularTradeIns() {
  const t = await getTranslations('home.popularTradeIns')

  const devices = deviceData.map(d => ({
    ...d,
    name: t(`${d.key}Name`),
    price: t(`${d.key}Price`),
  }))

  return (
    <section className="py-20 bg-white dark:bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollStagger staggerChildren={0.1} className="flex items-center justify-between mb-10">
          <ScrollReveal animation="left">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('heading')}</h2>
              <p className="text-slate-500 mt-2">{t('subheading')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <Link
              href="/trade/browse"
              className="text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              {t('viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </ScrollStagger>

        {/* Devices Grid */}
        <ScrollStagger staggerChildren={0.1} delayChildren={0.15} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {devices.map((device) => (
            <ScrollReveal key={device.key} animation="z">
              <Link href={device.href} className="group block">
                <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 transition-all group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/5">
                  <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    <div className="relative w-32 h-32 transition-transform group-hover:scale-110 duration-300">
                      <Image
                        src={device.image}
                        alt={device.name}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {device.name}
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      {t('upTo')} {device.price}
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
