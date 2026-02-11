import Link from 'next/link'
import {
  Tag,
  Truck,
  Banknote,
  Search,
  ClipboardCheck,
  Package,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react'

export const metadata = {
  title: 'How It Works - Trade-In Process',
  description: 'Learn how easy it is to trade in your electronics for cash. Get a quote, ship for free, and get paid fast.',
}

const mainSteps = [
  {
    number: 1,
    Icon: Search,
    title: 'Find Your Device',
    description: 'Search for your device model and answer a few simple questions about its condition.',
    details: [
      'Search by brand, model, or category',
      'Answer questions about device condition',
      'Get an instant quote in seconds'
    ]
  },
  {
    number: 2,
    Icon: Package,
    title: 'Ship It Free',
    description: 'Print your free prepaid shipping label and send your device to us securely.',
    details: [
      'Free prepaid shipping label provided',
      'Use any box you have at home',
      'Drop off at any carrier location'
    ]
  },
  {
    number: 3,
    Icon: Banknote,
    title: 'Get Paid Fast',
    description: 'Once we inspect your device, receive payment within 24 hours via your preferred method.',
    details: [
      'Choose PayPal, bank transfer, or gift card',
      'Payment within 24 hours of inspection',
      'Price lock guarantee for 14 days'
    ]
  },
]

const timeline = [
  { day: 'Day 1', action: 'Get Quote & Ship', Icon: Tag },
  { day: 'Day 2-3', action: 'Device In Transit', Icon: Truck },
  { day: 'Day 4', action: 'Inspection', Icon: ClipboardCheck },
  { day: 'Day 5', action: 'Payment Sent', Icon: CreditCard },
]

export default function HowItWorksPage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
              How It <span className="text-primary">Works</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Trading in your old electronics has never been easier. Follow these three simple steps and turn your unused tech into cash.
            </p>
          </div>
        </div>
      </section>

      {/* Main Steps */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {mainSteps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Icon & Number */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="size-32 bg-primary/10 rounded-3xl flex items-center justify-center">
                      <step.Icon className="size-16 text-primary" />
                    </div>
                    <div className="absolute -top-4 -right-4 size-12 bg-primary text-white font-bold text-xl rounded-full flex items-center justify-center border-4 border-background">
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                        <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{detail}</span>
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Typical Timeline
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              From quote to payment in as little as 5 business days
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 relative z-10">
                    <item.Icon className="size-8" />
                  </div>
                  <p className="text-sm font-bold text-primary">{item.day}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Clock className="size-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">14-Day Price Lock</h3>
              <p className="text-slate-600 dark:text-slate-400">Your quote is guaranteed for 14 days from the date you receive it.</p>
            </div>
            <div className="text-center p-6">
              <Shield className="size-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Data Security</h3>
              <p className="text-slate-600 dark:text-slate-400">All devices undergo military-grade data wiping before resale or recycling.</p>
            </div>
            <div className="text-center p-6">
              <Truck className="size-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Free Shipping</h3>
              <p className="text-slate-600 dark:text-slate-400">We cover all shipping costs with our prepaid labels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Search for your device now and get an instant quote. It only takes a minute.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-8 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Get Your Quote <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
