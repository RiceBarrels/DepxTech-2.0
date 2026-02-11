'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react'

export default function ReturnsPage() {
  const t = useTranslations('returns')

  const returnScenarios = [
    {
      key: 'conditionDiffers',
      title: t('scenarios.conditionDiffers.title'),
      description: t('scenarios.conditionDiffers.description'),
      options: t.raw('scenarios.conditionDiffers.options')
    },
    {
      key: 'changeOfMind',
      title: t('scenarios.changeOfMind.title'),
      description: t('scenarios.changeOfMind.description'),
      options: t.raw('scenarios.changeOfMind.options')
    },
    {
      key: 'processingIssues',
      title: t('scenarios.processingIssues.title'),
      description: t('scenarios.processingIssues.description'),
      options: t.raw('scenarios.processingIssues.options')
    },
  ]

  const returnProcess = [
    {
      step: 1,
      title: t('processSteps.step1.title'),
      description: t('processSteps.step1.description')
    },
    {
      step: 2,
      title: t('processSteps.step2.title'),
      description: t('processSteps.step2.description')
    },
    {
      step: 3,
      title: t('processSteps.step3.title'),
      description: t('processSteps.step3.description')
    },
    {
      step: 4,
      title: t('processSteps.step4.title'),
      description: t('processSteps.step4.description')
    },
  ]

  const importantNotes = t.raw('importantNotes')

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
              <RotateCcw className="size-4" />
              {t('badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {t('heading').split(t('headingHighlight'))[0]}
              <span className="text-primary">{t('headingHighlight')}</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {t('keyPoints.window.title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('keyPoints.window.description')}
              </p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {t('keyPoints.free.title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('keyPoints.free.description')}
              </p>
            </div>
            <div className="text-center p-4 sm:p-6">
              <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {t('keyPoints.condition.title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t('keyPoints.condition.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Scenarios */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {t('scenariosHeading')}
          </h2>

          <div className="space-y-6">
            {returnScenarios.map((item) => (
              <div key={item.key} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {item.description}
                </p>
                <div className="space-y-2">
                  {item.options.map((option) => (
                    <div key={option} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0" />
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {t('processHeading')}
          </h2>

          <div className="space-y-6">
            {returnProcess.map((item) => (
              <div key={item.step} className="flex gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="size-6 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {t('importantHeading')}
                </h3>
                <ul className="space-y-3">
                  {importantNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="size-4 flex-shrink-0 mt-1 text-slate-400" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="size-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('helpHeading')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              {t('helpDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@depxtech.com"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                {t('emailSupport')}
              </a>
              <Link
                href="/trade/faq"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('viewFaq')} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
