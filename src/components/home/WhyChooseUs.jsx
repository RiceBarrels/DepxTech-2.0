import { Link } from '@/i18n/navigation'
import {
  Recycle,
  Zap,
  DollarSign,
  Shield,
} from 'lucide-react'
import { ScrollStagger, ScrollReveal, ScrollCounter } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

const featureIcons = [Recycle, Zap, DollarSign, Shield]

export async function WhyChooseUs() {
  const t = await getTranslations('home.whyChooseUs')

  const features = [
    { Icon: featureIcons[0], title: t('zeroWasteTitle'), description: t('zeroWasteDesc') },
    { Icon: featureIcons[1], title: t('rapidPaymentTitle'), description: t('rapidPaymentDesc') },
    { Icon: featureIcons[2], title: t('bestPriceTitle'), description: t('bestPriceDesc') },
    { Icon: featureIcons[3], title: t('dataSecureTitle'), description: t('dataSecureDesc') },
  ]

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric heading column */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-20 mb-14">
          <ScrollReveal animation="left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {t('heading')}
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <div className="space-y-5">
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
                {t('description')}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Over <ScrollCounter value={12000} suffix=" kg" className="font-semibold text-emerald-600 dark:text-emerald-400" /> of e-waste diverted — and counting.
              </p>
              <div className="pt-1">
                <Link
                  href="/trade"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-900/30 dark:border-white/30 pb-0.5 hover:border-slate-900 dark:hover:border-white transition-colors"
                >
                  {t('cta')} →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Features row — flat divider style, no heavy cards */}
        <ScrollStagger staggerChildren={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 pt-10 border-t border-slate-200 dark:border-slate-800">
          {features.map((feature) => (
            <ScrollReveal key={feature.title} animation="bottom">
              <div className="flex flex-col gap-3">
                <feature.Icon className="w-6 h-6 text-slate-900 dark:text-white" strokeWidth={1.5} />
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
