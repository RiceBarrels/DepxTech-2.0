'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  Shield,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowRight,
  FileText
} from 'lucide-react'

export default function WarrantyPage() {
  const t = useTranslations('warranty')

  const warrantyFeatures = [
    {
      Icon: Shield,
      title: t('features.priceLock.title'),
      description: t('features.priceLock.description')
    },
    {
      Icon: Clock,
      title: t('features.deviceReturn.title'),
      description: t('features.deviceReturn.description')
    },
    {
      Icon: CheckCircle2,
      title: t('features.paymentGuarantee.title'),
      description: t('features.paymentGuarantee.description')
    },
    {
      Icon: FileText,
      title: t('features.dataWipe.title'),
      description: t('features.dataWipe.description')
    },
  ]

  const guarantees = t.raw('guarantees')

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {t('heading').split(t('headingHighlight'))[0]}
              <span className="text-primary">{t('headingHighlight')}</span>
              {t('heading').split(t('headingHighlight'))[1]}
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Features */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {warrantyFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <feature.Icon className="size-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Guarantees */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {t('promiseHeading')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {guarantees.map((guarantee) => (
              <div key={guarantee} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{guarantee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="size-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('questionsHeading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              {t('questionsDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trade/faq"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                {t('viewFaq')} <ArrowRight className="size-4" />
              </Link>
              <a
                href="mailto:support@depxtech.com"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('contactSupport')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
