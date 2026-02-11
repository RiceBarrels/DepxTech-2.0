import Link from 'next/link'
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

export const metadata = {
  title: 'Trade-In Process - Step by Step Guide',
  description: 'A detailed guide on how to trade in your electronics. Learn about each step from getting a quote to receiving payment.',
}

const processSteps = [
  {
    step: 1,
    Icon: Search,
    title: 'Search for Your Device',
    description: 'Start by searching for your device using our search bar or browse by category.',
    tips: [
      'Enter your device model (e.g., "iPhone 15 Pro")',
      'Be specific about storage capacity and color if applicable',
      'Check multiple variations if unsure about exact model'
    ]
  },
  {
    step: 2,
    Icon: FileText,
    title: 'Answer Condition Questions',
    description: 'Tell us about your device\'s condition to get an accurate quote.',
    tips: [
      'Be honest about screen condition (cracks, scratches)',
      'Check if all buttons and features work properly',
      'Note any water damage or battery issues'
    ]
  },
  {
    step: 3,
    Icon: Package,
    title: 'Accept Quote & Pack Device',
    description: 'If you\'re happy with the quote, accept it and prepare your device for shipping.',
    tips: [
      'Remove SIM cards and memory cards',
      'Factory reset and sign out of all accounts',
      'Use a sturdy box with proper padding'
    ]
  },
  {
    step: 4,
    Icon: Send,
    title: 'Ship Your Device',
    description: 'Print your free prepaid shipping label and drop off at any carrier location.',
    tips: [
      'Print the shipping label we email you',
      'Drop off at any authorized carrier location',
      'Keep your tracking number for reference'
    ]
  },
  {
    step: 5,
    Icon: ClipboardCheck,
    title: 'Device Inspection',
    description: 'Our experts will inspect your device within 24 hours of receipt.',
    tips: [
      'We verify device condition matches your description',
      'You\'ll receive notification when inspection is complete',
      'If condition differs, we\'ll offer an adjusted quote'
    ]
  },
  {
    step: 6,
    Icon: Banknote,
    title: 'Receive Payment',
    description: 'Once inspection is complete, receive payment via your chosen method.',
    tips: [
      'PayPal: Instant transfer',
      'Bank transfer: 1-2 business days',
      'Gift card: Instant digital delivery'
    ]
  },
]

const conditionGuide = [
  {
    condition: 'Like New',
    description: 'Device shows no signs of use. No scratches, scuffs, or marks.',
    percentage: '100%',
    color: 'bg-emerald-500'
  },
  {
    condition: 'Good',
    description: 'Minor cosmetic wear. Light scratches on body, screen is perfect.',
    percentage: '80-90%',
    color: 'bg-green-500'
  },
  {
    condition: 'Fair',
    description: 'Moderate wear. Visible scratches on screen or body, fully functional.',
    percentage: '60-75%',
    color: 'bg-amber-500'
  },
  {
    condition: 'Poor',
    description: 'Heavy wear, cracked screen, or functional issues. Still worth trading in!',
    percentage: '30-50%',
    color: 'bg-red-500'
  },
]

export default function ProcessPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
              Trade-In <span className="text-primary">Process</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              A detailed step-by-step guide to help you through the entire trade-in process. We make it simple and transparent.
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
                    <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-white relative z-10">
                      <item.Icon className="size-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-primary">Step {item.step}</span>
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
                        Tips
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
              Condition Guide
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Understanding how device condition affects your quote. The better the condition, the higher the payout.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {conditionGuide.map((item) => (
              <div key={item.condition} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className={`size-3 ${item.color} rounded-full mb-4`} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.condition}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {item.description}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {item.percentage}
                  <span className="text-sm font-normal text-slate-500 ml-1">of max value</span>
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
                  Before You Ship
                </h3>
                <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>Back up all your data - we cannot recover it after wiping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>Sign out of iCloud, Google, Samsung accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>Disable Find My Device / Activation Lock</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-1" />
                    <span>Remove SIM cards and memory cards</span>
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
              Ready to Start?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Get an instant quote for your device in just a few clicks.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Get Your Quote <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
