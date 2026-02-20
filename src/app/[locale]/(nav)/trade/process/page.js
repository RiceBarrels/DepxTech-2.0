import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import {
  Search,
  FileText,
  Package,
  Send,
  ClipboardCheck,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'

export default async function ProcessPage() {
  const t = await getTranslations('tradeProcess')

  const processSteps = [
    {
      step: 1,
      Icon: Search,
      title: t('step1Title'),
      description: t('step1Desc'),
      tips: [
        t('step1Tip1'),
        t('step1Tip2'),
        t('step1Tip3')
      ]
    },
    {
      step: 2,
      Icon: FileText,
      title: t('step2Title'),
      description: t('step2Desc'),
      tips: [
        t('step2Tip1'),
        t('step2Tip2'),
        t('step2Tip3')
      ]
    },
    {
      step: 3,
      Icon: Package,
      title: t('step3Title'),
      description: t('step3Desc'),
      tips: [
        t('step3Tip1'),
        t('step3Tip2'),
        t('step3Tip3')
      ]
    },
    {
      step: 4,
      Icon: Send,
      title: t('step4Title'),
      description: t('step4Desc'),
      tips: [
        t('step4Tip1'),
        t('step4Tip2'),
        t('step4Tip3')
      ]
    },
    {
      step: 5,
      Icon: ClipboardCheck,
      title: t('step5Title'),
      description: t('step5Desc'),
      tips: [
        t('step5Tip1'),
        t('step5Tip2'),
        t('step5Tip3')
      ]
    },
    {
      step: 6,
      Icon: Banknote,
      title: t('step6Title'),
      description: t('step6Desc'),
      tips: [
        t('step6Tip1'),
        t('step6Tip2'),
        t('step6Tip3')
      ]
    },
  ]

  const conditionGuide = [
    {
      condition: t('conditionLikeNew'),
      description: t('conditionLikeNewDesc'),
      percentage: t('conditionLikeNewPct'),
      color: 'bg-emerald-500'
    },
    {
      condition: t('conditionGood'),
      description: t('conditionGoodDesc'),
      percentage: t('conditionGoodPct'),
      color: 'bg-green-500'
    },
    {
      condition: t('conditionFair'),
      description: t('conditionFairDesc'),
      percentage: t('conditionFairPct'),
      color: 'bg-amber-500'
    },
    {
      condition: t('conditionPoor'),
      description: t('conditionPoorDesc'),
      percentage: t('conditionPoorPct'),
      color: 'bg-red-500'
    },
  ]
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {t('heading')} <span className="text-primary">{t('headingHighlight')}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('subheading')}
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {processSteps.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute left-8 top-20 bottom-0 w-0.5 bg-primary/20" />
                )}

                <div className="flex gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="size-12 sm:size-16 bg-primary rounded-2xl flex items-center justify-center text-white relative z-10">
                      <item.Icon className="size-6 sm:size-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-primary">{t('stepLabel', { step: item.step })}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {item.description}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Info className="size-4 text-primary" />
                        {t('tipsLabel')}
                      </p>
                      <ul className="space-y-2">
                        {item.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Condition Guide */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t('conditionGuideHeading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('conditionGuideSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {conditionGuide.map((item) => (
              <div key={item.condition} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
                <div className={`size-3 ${item.color} rounded-full mb-4`} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.condition}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {item.description}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {item.percentage}
                  <span className="text-sm font-normal text-slate-500 ml-1">{t('ofMaxValue')}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="size-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                  {t('notesHeading')}
                </h3>
                <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>{t('note1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>{t('note2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>{t('note3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>{t('note4')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              {t('ctaSubheading')}
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
