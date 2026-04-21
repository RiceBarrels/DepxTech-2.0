import { Tag, Truck, Banknote } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

const stepIcons = [Tag, Truck, Banknote]

export async function HowItWorks() {
  const t = await getTranslations('home.howItWorks')

  const steps = [
    { number: '01', Icon: stepIcons[0], title: t('step1Title'), description: t('step1Desc') },
    { number: '02', Icon: stepIcons[1], title: t('step2Title'), description: t('step2Desc') },
    { number: '03', Icon: stepIcons[2], title: t('step3Title'), description: t('step3Desc') },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — left aligned, not perfectly centered */}
        <ScrollStagger staggerChildren={0.08} className="max-w-2xl mb-14">
          <ScrollReveal animation="bottom">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
              {t('heading')}
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="bottom">
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              {t('subheading')}
            </p>
          </ScrollReveal>
        </ScrollStagger>

        {/* Steps — flat, editorial 3 column layout, no bubble numbers */}
        <ScrollStagger staggerChildren={0.12} delayChildren={0.05} className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step) => (
            <ScrollReveal key={step.number} animation="bottom">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline gap-4 mb-1">
                  <span className="text-sm font-mono tabular-nums text-slate-400 dark:text-slate-600">{step.number}</span>
                  <step.Icon className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
