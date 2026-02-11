'use client'

import { motion } from 'framer-motion'
import { Tag, Truck, Banknote } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'

const steps = [
  {
    number: 1,
    Icon: Tag,
    title: 'Get an Instant Quote',
    description: 'Search for your device, answer a few questions about its condition, and get an offer in seconds.',
  },
  {
    number: 2,
    Icon: Truck,
    title: 'Ship for Free',
    description: 'Print your pre-paid shipping label, pack your device, and drop it off at any authorized location.',
  },
  {
    number: 3,
    Icon: Banknote,
    title: 'Get Paid Fast',
    description: 'Receive funds via PayPal, Bank Transfer, or Gift Card within 24 hours of device inspection.',
  },
]

export function HowItWorks() {
  const animations = ['left', 'bottom', 'right']

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollStagger staggerChildren={0.15} className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal animation="top">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
              Three simple steps to cash
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="blur">
            <p className="text-slate-500 text-lg">
              Selling your old tech shouldn't be a headache. We've streamlined the process to be as fast as possible.
            </p>
          </ScrollReveal>
        </ScrollStagger>

        {/* Steps */}
        <ScrollStagger staggerChildren={0.2} delayChildren={0.1} className="grid md:grid-cols-3 gap-12 relative">
          {steps.map((step, idx) => (
            <ScrollReveal
              key={step.number}
              animation={animations[idx]}
              className="flex flex-col items-center text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative mb-6"
              >
                <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <step.Icon className="w-10 h-10" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 10, delay: idx * 0.15 + 0.5 }}
                  className="absolute -top-3 -right-3 size-8 bg-primary text-white font-bold rounded-full flex items-center justify-center border-4 border-background"
                >
                  {step.number}
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
