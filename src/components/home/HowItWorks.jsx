import { Tag, Truck, Banknote } from 'lucide-react'
import { GSAPReveal } from '@/components/ui/scroll-animation-gsap'
import { getTranslations } from 'next-intl/server'

const stepIcons = [Tag, Truck, Banknote]

export async function HowItWorks() {
  const t = await getTranslations('home.howItWorks')
  const froms = ['left', 'bottom', 'right']

  const steps = [
    { number: 1, Icon: stepIcons[0], title: t('step1Title'), description: t('step1Desc') },
    { number: 2, Icon: stepIcons[1], title: t('step2Title'), description: t('step2Desc') },
    { number: 3, Icon: stepIcons[2], title: t('step3Title'), description: t('step3Desc') },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <GSAPReveal from="top">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              {t('heading')}
            </h2>
          </GSAPReveal>
          <GSAPReveal from="blur" delay={0.1}>
            <p className="text-slate-500 text-lg">
              {t('subheading')}
            </p>
          </GSAPReveal>
        </div>

        {/* Steps — alternating left/bottom/right entrances */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-12 relative">
          {steps.map((step, idx) => (
            <GSAPReveal
              key={step.number}
              from={froms[idx]}
              delay={idx * 0.12}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-6">
                <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <step.Icon className="w-10 h-10" />
                </div>
                <div className="absolute -top-3 -right-3 size-8 bg-primary text-white font-bold rounded-full flex items-center justify-center border-4 border-background">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </GSAPReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
