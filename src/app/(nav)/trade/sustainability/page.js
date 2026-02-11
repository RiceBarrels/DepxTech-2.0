import Link from 'next/link'
import {
  Leaf,
  Recycle,
  Droplets,
  Wind,
  Zap,
  TreePine,
  Globe2,
  Factory,
  ArrowRight,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'

export const metadata = {
  title: 'Sustainability - Our Environmental Commitment',
  description: 'Learn about our commitment to sustainability and how trading in your electronics helps reduce e-waste and protect the environment.',
}

const impactStats = [
  {
    Icon: Recycle,
    value: '1.2M+',
    label: 'kg e-waste diverted',
    description: 'Devices recycled or refurbished instead of landfilled'
  },
  {
    Icon: Wind,
    value: '2.5M+',
    label: 'kg CO2 prevented',
    description: 'Carbon emissions avoided through device reuse'
  },
  {
    Icon: Droplets,
    value: '50M+',
    label: 'liters water conserved',
    description: 'Water saved by not manufacturing new devices'
  },
  {
    Icon: TreePine,
    value: '100K+',
    label: 'trees equivalent',
    description: 'Positive environmental impact measured'
  },
]

const principles = [
  {
    Icon: Recycle,
    title: 'Refurbish First',
    description: 'We prioritize refurbishing and reselling devices to extend their lifespan, keeping electronics in use longer and reducing demand for new manufacturing.'
  },
  {
    Icon: Factory,
    title: 'Responsible Recycling',
    description: 'Devices that cannot be refurbished are sent to R2-certified recycling partners who follow the highest environmental and safety standards.'
  },
  {
    Icon: Zap,
    title: 'Energy Efficiency',
    description: 'Our facilities use renewable energy sources, and we continuously work to reduce our operational carbon footprint.'
  },
  {
    Icon: Globe2,
    title: 'Circular Economy',
    description: 'We believe in keeping resources in use for as long as possible, extracting maximum value while minimizing waste and environmental impact.'
  },
]

const deviceImpact = [
  {
    device: 'Smartphone',
    co2: '70 kg',
    water: '12,760 L',
    minerals: '30+ rare metals'
  },
  {
    device: 'Laptop',
    co2: '300-400 kg',
    water: '50,000 L',
    minerals: '40+ rare metals'
  },
  {
    device: 'Tablet',
    co2: '100 kg',
    water: '20,000 L',
    minerals: '35+ rare metals'
  },
]

export default function SustainabilityPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 dark:from-emerald-900/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
              <Leaf className="size-4" />
              Our Commitment to the Planet
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Sustainability at <span className="text-emerald-500">DepxTech</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Every device you trade in makes a difference. We're committed to reducing e-waste and building a more sustainable future for electronics.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Our Collective Impact
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Together with our community, here's the environmental impact we've made
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {impactStats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 text-center">
                <div className="size-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.Icon className="size-7 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                The E-Waste Problem
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                Electronic waste is the world's fastest-growing waste stream. Every year, millions of devices end up in landfills, releasing toxic materials into our environment.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">50+ million tons of e-waste generated globally each year</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">Only 17% of e-waste is properly recycled</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-1" />
                  <span className="text-slate-300">E-waste contains toxic materials like lead, mercury, and cadmium</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Manufacturing Impact Per Device</h3>
              <div className="space-y-4">
                {deviceImpact.map((item) => (
                  <div key={item.device} className="bg-slate-700/50 rounded-xl p-4">
                    <p className="font-bold text-white mb-2">{item.device}</p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">CO2</p>
                        <p className="text-emerald-400 font-medium">{item.co2}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Water</p>
                        <p className="text-emerald-400 font-medium">{item.water}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Minerals</p>
                        <p className="text-emerald-400 font-medium">{item.minerals}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Principles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Our Sustainability Principles
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We're guided by a commitment to environmental responsibility at every step of our process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {principles.map((principle) => (
              <div key={principle.title} className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-shrink-0">
                  <div className="size-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <principle.Icon className="size-6 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Certified & Compliant
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our recycling partners meet the highest industry standards
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center p-3 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">R2</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">R2 Certified</p>
              <p className="text-xs text-slate-500">Responsible Recycling Standard</p>
            </div>
            <div className="text-center p-3 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">ISO</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">ISO 14001</p>
              <p className="text-xs text-slate-500">Environmental Management</p>
            </div>
            <div className="text-center p-3 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="text-4xl font-bold text-primary mb-2">NIST</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">NIST 800-88</p>
              <p className="text-xs text-slate-500">Data Sanitization</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
            <Leaf className="size-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Join the Movement
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Every device traded in is a step towards a more sustainable future. Get paid while helping the planet.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold py-4 px-8 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Start Trading In <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
