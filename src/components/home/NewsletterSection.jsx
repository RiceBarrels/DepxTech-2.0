'use client'

import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { NewsletterForm } from '@/components/home/NewsletterForm'
import { ScrollStagger, ScrollReveal, ScrollScale } from '@/components/ui/scroll-animation'

export function NewsletterSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollScale>
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-16 text-center relative overflow-hidden">
            {/* Background Icon */}
            <motion.div
              initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
              whileInView={{ opacity: 0.1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-0 right-0 p-6 sm:p-8 md:p-12 pointer-events-none"
            >
              <Leaf className="w-48 h-48" />
            </motion.div>

            <ScrollStagger staggerChildren={0.15} className="relative z-10">
              <ScrollReveal animation="top">
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                  Stay updated on trade-in prices
                </h2>
              </ScrollReveal>
              <ScrollReveal animation="blur">
                <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                  Sign up for our newsletter and get notified when payout prices for your specific devices peak.
                </p>
              </ScrollReveal>
              <ScrollReveal animation="bottom">
                <NewsletterForm />
              </ScrollReveal>
            </ScrollStagger>
          </div>
        </ScrollScale>
      </div>
    </section>
  )
}
