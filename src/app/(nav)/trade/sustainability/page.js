'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
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
} from 'lucide-react'

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

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function SustainabilityPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-emerald-50 dark:bg-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
              <Leaf className="size-4" />
              Our Commitment to the Planet
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              Sustainability at <span className="text-emerald-500">DepxTech</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Every device you trade in makes a difference. We're committed to reducing e-waste and building a more sustainable future for electronics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Collective Impact
            </h2>
            <p className="text-muted-foreground">
              Together with our community, here's the environmental impact we've made
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {impactStats.map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-card rounded-2xl p-4 sm:p-6 border border-border text-center"
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="size-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.Icon className="size-7 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                The E-Waste Problem
              </h2>
              <p className="text-background/70 text-lg mb-6">
                Electronic waste is the world's fastest-growing waste stream. Every year, millions of devices end up in landfills, releasing toxic materials into our environment.
              </p>
              <motion.ul
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  '50+ million tons of e-waste generated globally each year',
                  'Only 17% of e-waste is properly recycled',
                  'E-waste contains toxic materials like lead, mercury, and cadmium',
                ].map((text, i) => (
                  <motion.li key={i} className="flex items-start gap-3" variants={staggerItem}>
                    <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-background/70">{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              className="bg-background/10 rounded-2xl p-6"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold mb-4">Manufacturing Impact Per Device</h3>
              <div className="space-y-4">
                {deviceImpact.map((item) => (
                  <div key={item.device} className="bg-background/10 rounded-xl p-4">
                    <p className="font-bold mb-2">{item.device}</p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                      <div>
                        <p className="text-background/50">CO2</p>
                        <p className="text-emerald-400 font-medium">{item.co2}</p>
                      </div>
                      <div>
                        <p className="text-background/50">Water</p>
                        <p className="text-emerald-400 font-medium">{item.water}</p>
                      </div>
                      <div>
                        <p className="text-background/50">Minerals</p>
                        <p className="text-emerald-400 font-medium">{item.minerals}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Principles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Sustainability Principles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're guided by a commitment to environmental responsibility at every step of our process.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {principles.map((principle) => (
              <motion.div
                key={principle.title}
                className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-card rounded-2xl border border-border"
                variants={staggerItem}
                whileHover={{ y: -2 }}
              >
                <div className="flex-shrink-0">
                  <div className="size-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <principle.Icon className="size-6 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Certified & Compliant
            </h2>
            <p className="text-muted-foreground">
              Our recycling partners meet the highest industry standards
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-3 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { code: 'R2', name: 'R2 Certified', desc: 'Responsible Recycling Standard' },
              { code: 'ISO', name: 'ISO 14001', desc: 'Environmental Management' },
              { code: 'NIST', name: 'NIST 800-88', desc: 'Data Sanitization' },
            ].map((cert) => (
              <motion.div
                key={cert.code}
                className="text-center p-3 sm:p-6 bg-muted/50 rounded-2xl"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-4xl font-bold text-primary mb-2">{cert.code}</div>
                <p className="text-sm font-medium text-foreground mb-1">{cert.name}</p>
                <p className="text-xs text-muted-foreground">{cert.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-emerald-600 rounded-3xl p-6 sm:p-8 lg:p-12 text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Leaf className="size-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Join the Movement
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Every device traded in is a step towards a more sustainable future. Get paid while helping the planet.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold py-4 px-8 rounded-xl hover:bg-white/90 transition-colors"
            >
              Start Trading In <ArrowRight className="size-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
