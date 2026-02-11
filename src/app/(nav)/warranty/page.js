import Link from 'next/link'
import {
  Shield,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowRight,
  FileText
} from 'lucide-react'

export const metadata = {
  title: 'Warranty Information',
  description: 'Learn about our warranty policies and guarantees for trade-in services.',
}

const warrantyFeatures = [
  {
    Icon: Shield,
    title: '14-Day Price Lock Guarantee',
    description: 'Your quoted price is guaranteed for 14 days from the date of quote. Ship your device within this window to lock in your price.'
  },
  {
    Icon: Clock,
    title: 'Device Return Policy',
    description: 'If our inspection reveals a condition difference and you don\'t accept the adjusted offer, we\'ll return your device at no cost within 7 business days.'
  },
  {
    Icon: CheckCircle2,
    title: 'Payment Guarantee',
    description: 'Once your quote is confirmed after inspection, payment is guaranteed within 24 hours. No exceptions.'
  },
  {
    Icon: FileText,
    title: 'Data Wipe Certificate',
    description: 'Upon request, we provide a certificate of data destruction confirming your device was wiped using NIST 800-88 compliant methods.'
  },
]

const guarantees = [
  'Free shipping on all trade-ins',
  'No hidden fees or deductions',
  'Instant quotes with no obligation',
  'Secure and insured shipping',
  'Transparent inspection process',
  'Multiple payment options',
]

export default function WarrantyPage() {
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
              Our <span className="text-primary">Guarantees</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We stand behind our trade-in process with clear guarantees and transparent policies.
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
            What We Promise
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
              Have Questions?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Check our FAQ or contact our support team for more information about our policies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trade/faq"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                View FAQ <ArrowRight className="size-4" />
              </Link>
              <a
                href="mailto:support@depxtech.com"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
