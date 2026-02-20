import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import {
  Truck,
  Banknote,
  Search,
  ClipboardCheck,
  Package,
  CreditCard,
  Tag,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react'

export default async function HowItWorksPage() {
  const t = await getTranslations('tradeHowItWorks')

  const mainSteps = [
    {
      number: 1,
      Icon: Search,
      title: t('step1Title'),
      description: t('step1Desc'),
      details: [t('step1Detail1'), t('step1Detail2'), t('step1Detail3')]
    },
    {
      number: 2,
      Icon: Package,
      title: t('step2Title'),
      description: t('step2Desc'),
      details: [t('step2Detail1'), t('step2Detail2'), t('step2Detail3')]
    },
    {
      number: 3,
      Icon: Banknote,
      title: t('step3Title'),
      description: t('step3Desc'),
      details: [t('step3Detail1'), t('step3Detail2'), t('step3Detail3')]
    },
  ]

  const timeline = [
    { day: t('timelineDay1'), action: t('timelineAction1'), Icon: Tag },
    { day: t('timelineDay2'), action: t('timelineAction2'), Icon: Truck },
    { day: t('timelineDay3'), action: t('timelineAction3'), Icon: ClipboardCheck },
    { day: t('timelineDay4'), action: t('timelineAction4'), Icon: CreditCard },
  ]

  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              {t('heading')}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t('subheading')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Steps */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 md:space-y-16">
            {mainSteps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Icon & Number */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="size-24 sm:size-32 bg-primary/10 rounded-3xl flex items-center justify-center">
                      <step.Icon className="size-10 sm:size-16 text-primary" />
                    </div>
                    <div className="absolute -top-4 -right-4 size-10 sm:size-12 bg-primary text-primary-foreground font-bold text-xl rounded-full flex items-center justify-center border-4 border-background">
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 justify-center lg:justify-start"
                      >
                        <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('timelineHeading')}
            </h2>
            <p className="text-muted-foreground">
              {t('timelineSubheading')}
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center"
                >
                  <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-4 relative z-10">
                    <item.Icon className="size-8" />
                  </div>
                  <p className="text-sm font-bold text-primary">{item.day}</p>
                  <p className="text-sm text-muted-foreground text-center">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { Icon: Clock, title: t('trust1Title'), desc: t('trust1Desc') },
              { Icon: Shield, title: t('trust2Title'), desc: t('trust2Desc') },
              { Icon: Truck, title: t('trust3Title'), desc: t('trust3Desc') },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-4 sm:p-6"
              >
                <item.Icon className="size-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              {t('ctaSubheading')}
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-background text-foreground font-bold py-4 px-8 rounded-xl hover:bg-background/90 transition-colors"
            >
              {t('ctaButton')} <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
