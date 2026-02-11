'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

export default function ShippingPage() {
  const t = useTranslations('shipping')

  const shippingFeatures = [
    {
      Icon: Truck,
      title: t('features.freeShipping.title'),
      description: t('features.freeShipping.description')
    },
    {
      Icon: Shield,
      title: t('features.insured.title'),
      description: t('features.insured.description')
    },
    {
      Icon: MapPin,
      title: t('features.dropOff.title'),
      description: t('features.dropOff.description')
    },
    {
      Icon: Clock,
      title: t('features.fastTransit.title'),
      description: t('features.fastTransit.description')
    },
  ]

  const packingTips = [
    {
      title: t('tips.tip1.title'),
      description: t('tips.tip1.description')
    },
    {
      title: t('tips.tip2.title'),
      description: t('tips.tip2.description')
    },
    {
      title: t('tips.tip3.title'),
      description: t('tips.tip3.description')
    },
    {
      title: t('tips.tip4.title'),
      description: t('tips.tip4.description')
    },
  ]

  const beforeShipping = t.raw('beforeShipItems')

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
              <Truck className="size-4" />
              {t('badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {t('heading')} <span className="text-primary">{t('headingHighlight')}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Features */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {shippingFeatures.map((feature) => (
              <div key={feature.title} className="text-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.Icon className="size-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Ship */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {t('howToShip')}
          </h2>

          <div className="space-y-6">
            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t('steps.step1.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400">{t('steps.step1.description')}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t('steps.step2.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400">{t('steps.step2.description')}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t('steps.step3.title')}</h3>
                <p className="text-slate-600 dark:text-slate-400">{t('steps.step3.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packing Tips */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Package className="size-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('packingTips')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('packingTipsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {packingTips.map((tip, index) => (
              <div key={tip.title} className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm mb-4">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before Shipping Checklist */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="size-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-4">
                  {t('beforeShipChecklist')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {beforeShipping.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <CheckCircle2 className="size-4 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              {t('ctaDescription')}
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t('ctaButton')} <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
