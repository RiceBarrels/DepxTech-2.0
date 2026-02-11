import Link from 'next/link'
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Mail,
  ArrowRight
} from 'lucide-react'

export const metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about our trade-in process, shipping, payments, and more.',
}

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How does the trade-in process work?',
        a: 'It\'s simple: 1) Search for your device and answer questions about its condition to get an instant quote. 2) Accept the quote and ship your device for free using our prepaid label. 3) Once we inspect your device, you\'ll receive payment within 24 hours.'
      },
      {
        q: 'What devices do you accept?',
        a: 'We accept a wide range of electronics including smartphones, laptops, tablets, gaming consoles, smartwatches, and audio devices from all major brands like Apple, Samsung, Google, Microsoft, Sony, and more.'
      },
      {
        q: 'How do I get a quote for my device?',
        a: 'Simply search for your device model on our trade-in page, answer a few questions about its condition (screen, functionality, etc.), and you\'ll receive an instant quote. The whole process takes less than a minute.'
      },
    ]
  },
  {
    category: 'Quotes & Pricing',
    questions: [
      {
        q: 'How is my quote calculated?',
        a: 'Your quote is based on several factors including the device model, storage capacity, condition, and current market value. We use real-time market data to ensure you get competitive pricing.'
      },
      {
        q: 'How long is my quote valid?',
        a: 'Your quote is locked for 14 days from the date you receive it. Ship your device within this window to guarantee your quoted price.'
      },
      {
        q: 'What if the condition is different than I described?',
        a: 'If our inspection reveals that your device\'s condition differs from what was described, we\'ll offer an adjusted quote. You can accept the new offer or request your device back at no cost.'
      },
    ]
  },
  {
    category: 'Shipping',
    questions: [
      {
        q: 'Is shipping really free?',
        a: 'Yes! We provide a prepaid shipping label for all trade-ins. Simply print the label, pack your device securely, and drop it off at any authorized carrier location.'
      },
      {
        q: 'How should I pack my device?',
        a: 'Use a sturdy box with padding material (bubble wrap, paper, etc.) to protect your device during transit. Remove any SIM cards, memory cards, and personal accessories before shipping.'
      },
      {
        q: 'How can I track my shipment?',
        a: 'Once you ship your device, you can track it using the tracking number provided on your shipping label. We\'ll also send you email updates at each stage of the process.'
      },
    ]
  },
  {
    category: 'Payment',
    questions: [
      {
        q: 'What payment methods do you offer?',
        a: 'We offer payment via PayPal, direct bank transfer (ACH), and digital gift cards. Choose your preferred method when accepting your quote.'
      },
      {
        q: 'How quickly will I get paid?',
        a: 'Once our inspection is complete and the quote is confirmed, you\'ll receive payment within 24 hours. PayPal and gift cards are instant; bank transfers may take 1-2 additional business days.'
      },
      {
        q: 'Are there any fees?',
        a: 'No hidden fees! The quote you see is the amount you\'ll receive. We cover all shipping costs and don\'t deduct any processing fees from your payment.'
      },
    ]
  },
  {
    category: 'Data & Security',
    questions: [
      {
        q: 'What happens to my data?',
        a: 'We use military-grade data wiping software (NIST 800-88 compliant) to completely erase all personal data from every device we receive. Your data is never accessible to anyone.'
      },
      {
        q: 'Do I need to factory reset my device before sending it?',
        a: 'While we\'ll wipe all data anyway, we recommend backing up your data and performing a factory reset before shipping. Also, sign out of all accounts (iCloud, Google, Samsung, etc.) and disable Find My Device.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. We use industry-standard encryption for all transactions. Your payment information is processed securely through trusted payment processors.'
      },
    ]
  },
  {
    category: 'Device Condition',
    questions: [
      {
        q: 'Will you accept devices with cracked screens?',
        a: 'Yes! We accept devices in all conditions, including those with cracked screens. Your quote will reflect the device\'s current condition.'
      },
      {
        q: 'What about devices that don\'t turn on?',
        a: 'We accept non-functional devices too. While the payout will be lower, we can still offer value for most devices, even if they\'re not working.'
      },
      {
        q: 'Do you accept devices with water damage?',
        a: 'Yes, we accept water-damaged devices. Be sure to accurately describe the damage when getting your quote to receive an accurate offer.'
      },
    ]
  },
]

export default function FAQPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="size-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Find answers to the most common questions about our trade-in process. Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((category) => (
              <div key={category.category}>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <details
                      key={index}
                      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                        <span className="font-medium text-slate-900 dark:text-white pr-4">
                          {faq.q}
                        </span>
                        <ChevronDown className="size-5 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0" />
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our support team is here to help
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a
              href="mailto:support@depxtech.com"
              className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Mail className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Email Us</p>
                <p className="text-sm text-slate-500">support@depxtech.com</p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Live Chat</p>
                <p className="text-sm text-slate-500">Available 9am-5pm EST</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Trade In?
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
