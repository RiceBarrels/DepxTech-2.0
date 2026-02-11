import Link from 'next/link'
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react'

export const metadata = {
  title: '30-Day Return Policy',
  description: 'Learn about our 30-day device return policy. We make it easy to get your device back if needed.',
}

const returnScenarios = [
  {
    scenario: 'Condition Differs from Quote',
    description: 'If our inspection reveals that your device condition is different from what was described, we\'ll provide an adjusted quote.',
    options: [
      'Accept the new offer and receive payment',
      'Request your device back at no cost'
    ]
  },
  {
    scenario: 'Change of Mind',
    description: 'Decided you want to keep your device? No problem. Request a return before inspection is complete.',
    options: [
      'Contact us to halt the trade-in process',
      'Device returned within 7 business days'
    ]
  },
  {
    scenario: 'Processing Issues',
    description: 'In the rare case of a processing issue on our end, we\'ll make it right.',
    options: [
      'Full return of your device',
      'Or corrected payment if applicable'
    ]
  },
]

const returnProcess = [
  {
    step: 1,
    title: 'Contact Us',
    description: 'Email support@depxtech.com or use live chat to initiate your return request.'
  },
  {
    step: 2,
    title: 'Return Approved',
    description: 'We\'ll confirm your return within 24 hours and provide a timeline.'
  },
  {
    step: 3,
    title: 'Device Shipped Back',
    description: 'Your device will be shipped back to you at no cost via tracked shipping.'
  },
  {
    step: 4,
    title: 'Receive Your Device',
    description: 'Typical return delivery is 5-7 business days from approval.'
  },
]

const importantNotes = [
  'Returns must be requested within 30 days of sending your device',
  'Returns are free—we cover all return shipping costs',
  'Devices are returned in the condition we received them',
  'Once payment is processed, returns are no longer available',
  'We cannot return devices that have already been refurbished or recycled'
]

export default function ReturnsPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
              <RotateCcw className="size-4" />
              Hassle-Free Returns
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              30-Day <span className="text-primary">Return Policy</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Changed your mind? No worries. We make it easy to get your device back with our straightforward return policy.
            </p>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">30-Day Window</h3>
              <p className="text-slate-600 dark:text-slate-400">Request a return within 30 days of sending your device</p>
            </div>
            <div className="text-center p-6">
              <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Free Returns</h3>
              <p className="text-slate-600 dark:text-slate-400">We cover all return shipping costs—no fees</p>
            </div>
            <div className="text-center p-6">
              <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Same Condition</h3>
              <p className="text-slate-600 dark:text-slate-400">Your device is returned exactly as we received it</p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Scenarios */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            When Can You Request a Return?
          </h2>

          <div className="space-y-6">
            {returnScenarios.map((item) => (
              <div key={item.scenario} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.scenario}
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
            How Returns Work
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
                  Important Information
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
              Need to Request a Return?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Contact our support team and we'll help you through the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@depxtech.com"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Email Support
              </a>
              <Link
                href="/trade/faq"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                View FAQ <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
