import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Recycle,
  Zap,
  DollarSign,
  Shield,
  Check,
} from 'lucide-react'
import { GSAPStagger, GSAPReveal, GSAPCounter } from '@/components/ui/scroll-animation-gsap'
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
              <GSAPStagger staggerChildren={0.12} from="left" className="flex flex-col gap-4">
                {features.slice(0, 2).map((feature) => (
                  <div
                    key={feature.title}
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
                ))}
              </GSAPStagger>
              <GSAPStagger staggerChildren={0.12} delayChildren={0.15} from="right" className="flex flex-col gap-4 mt-8">
                {features.slice(2, 4).map((feature) => (
                  <div
                    key={feature.title}
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
                ))}
              </GSAPStagger>
            </div>
          </div>

          {/* Content */}
          <GSAPStagger staggerChildren={0.1} from="right" className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {t('heading')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('description')}
            </p>

            {/* Benefits */}
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Over <GSAPCounter value={12000} suffix=" kg" className="text-emerald-500" /> {t('eWasteDiverted')}
                  </h3>
                  <p className="text-slate-500">{t('eWasteDesc')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{t('r2Certified')}</h3>
                  <p className="text-slate-500">{t('r2Desc')}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href="/trade"
                className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-xl transition-colors"
              >
                {t('cta')}
              </Link>
            </div>
          </GSAPStagger>
        </div>
      </div>
    </section>
  )
}
