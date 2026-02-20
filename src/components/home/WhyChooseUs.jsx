import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Recycle,
  Zap,
  DollarSign,
  Shield,
  Check,
} from 'lucide-react'
import { ScrollStagger, ScrollReveal, ScrollCounter } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

const featureIcons = [Recycle, Zap, DollarSign, Shield]
const featureStyles = [
  { bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' },
  { bgColor: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-primary' },
  { bgColor: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-primary' },
  { bgColor: 'bg-primary text-white', iconColor: 'text-white', isHighlighted: true },
]

export async function WhyChooseUs() {
  const t = await getTranslations('home.whyChooseUs')

  const features = [
    { Icon: featureIcons[0], title: t('zeroWasteTitle'), description: t('zeroWasteDesc'), ...featureStyles[0] },
    { Icon: featureIcons[1], title: t('rapidPaymentTitle'), description: t('rapidPaymentDesc'), ...featureStyles[1] },
    { Icon: featureIcons[2], title: t('bestPriceTitle'), description: t('bestPriceDesc'), ...featureStyles[2] },
    { Icon: featureIcons[3], title: t('dataSecureTitle'), description: t('dataSecureDesc'), ...featureStyles[3] },
  ]

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Feature Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <ScrollStagger staggerChildren={0.15} className="flex flex-col gap-4">
                {features.slice(0, 2).map((feature) => (
                  <ScrollReveal key={feature.title} animation="left">
                    <div
                      className={cn('p-4 sm:p-6 md:p-8 rounded-3xl', feature.bgColor)}
                    >
                      <feature.Icon className={cn('w-10 h-10 mb-4', feature.iconColor)} />
                      <h4 className={cn(
                        'font-bold text-lg mb-2',
                        feature.isHighlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                      )}>
                        {feature.title}
                      </h4>
                      <p className={cn(
                        'text-sm',
                        feature.isHighlighted ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                      )}>
                        {feature.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </ScrollStagger>
              <ScrollStagger staggerChildren={0.15} delayChildren={0.2} className="flex flex-col gap-4 mt-8">
                {features.slice(2, 4).map((feature) => (
                  <ScrollReveal key={feature.title} animation="right">
                    <div
                      className={cn('p-4 sm:p-6 md:p-8 rounded-3xl', feature.bgColor)}
                    >
                      <feature.Icon className={cn('w-10 h-10 mb-4', feature.iconColor)} />
                      <h4 className={cn(
                        'font-bold text-lg mb-2',
                        feature.isHighlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                      )}>
                        {feature.title}
                      </h4>
                      <p className={cn(
                        'text-sm',
                        feature.isHighlighted ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                      )}>
                        {feature.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </ScrollStagger>
            </div>
          </div>

          {/* Content */}
          <ScrollStagger staggerChildren={0.12} className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <ScrollReveal animation="right">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {t('heading')}
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="right">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('description')}
              </p>
            </ScrollReveal>

            {/* Benefits */}
            <div className="flex flex-col gap-6">
              <ScrollReveal animation="bottom">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Over <ScrollCounter value={12000} suffix=" kg" className="text-emerald-500" /> {t('eWasteDiverted')}
                    </h5>
                    <p className="text-slate-500">{t('eWasteDesc')}</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="bottom">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{t('r2Certified')}</h5>
                    <p className="text-slate-500">{t('r2Desc')}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* CTA */}
            <ScrollReveal animation="blur">
              <div className="pt-4">
                <Link
                  href="/trade"
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-xl transition-colors"
                >
                  {t('cta')}
                </Link>
              </div>
            </ScrollReveal>
          </ScrollStagger>
        </div>
      </div>
    </section>
  )
}
