import Link from 'next/link'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

export const metadata = {
  title: 'Free Shipping - Trade-In Program',
  description: 'Learn about our free shipping policy for trade-ins. We cover all shipping costs with prepaid labels.',
}

const shippingFeatures = [
  {
    Icon: Truck,
    title: '100% Free Shipping',
    description: 'We cover all shipping costs for trade-ins. Simply print your prepaid label and drop off your package.'
  },
  {
    Icon: Shield,
    title: 'Fully Insured',
    description: 'All shipments are fully insured up to your quoted value. Your device is protected from pickup to delivery.'
  },
  {
    Icon: MapPin,
    title: 'Multiple Drop-Off Options',
    description: 'Drop off at any authorized carrier location near you. Choose from thousands of convenient locations.'
  },
  {
    Icon: Clock,
    title: 'Fast Transit',
    description: 'Typical transit time is 2-3 business days. Track your package every step of the way.'
  },
]

const packingTips = [
  {
    title: 'Use a Sturdy Box',
    description: 'Choose a box that\'s slightly larger than your device to allow for padding.'
  },
  {
    title: 'Wrap Your Device',
    description: 'Use bubble wrap, paper, or soft material to protect your device from impacts.'
  },
  {
    title: 'Fill Empty Space',
    description: 'Add packing material to prevent movement during transit.'
  },
  {
    title: 'Seal Securely',
    description: 'Use strong packing tape to seal all box openings.'
  },
]

const beforeShipping = [
  'Back up all your data',
  'Factory reset your device',
  'Sign out of all accounts (iCloud, Google, Samsung)',
  'Disable Find My Device / Activation Lock',
  'Remove SIM cards and memory cards',
  'Remove cases and accessories'
]

export default function ShippingPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
              <Truck className="size-4" />
              Always Free
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Free <span className="text-primary">Shipping</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We make shipping easy and completely free. Get a prepaid label, pack your device, and drop it off—we handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Features */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {shippingFeatures.map((feature) => (
              <div key={feature.title} className="text-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.Icon className="size-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Ship */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            How to Ship Your Device
          </h2>

          <div className="space-y-6">
            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Accept Your Quote</h3>
                <p className="text-slate-600 dark:text-slate-400">Once you accept your quote, we'll email you a prepaid shipping label within minutes.</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Print Your Label</h3>
                <p className="text-slate-600 dark:text-slate-400">Print the prepaid shipping label and attach it securely to your package.</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Drop Off Your Package</h3>
                <p className="text-slate-600 dark:text-slate-400">Take your package to any authorized carrier location. No payment needed—it's prepaid!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packing Tips */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Package className="size-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Packing Tips
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Pack your device safely to ensure it arrives in the same condition
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {packingTips.map((tip, index) => (
              <div key={tip.title} className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm mb-4">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before Shipping Checklist */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="size-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-4">
                  Before You Ship Checklist
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {beforeShipping.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <CheckCircle2 className="size-4 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Trade In?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Get your free quote and prepaid shipping label today.
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
