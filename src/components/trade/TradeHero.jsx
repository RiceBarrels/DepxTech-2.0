'use client'

import TradeSearch from './TradeSearch'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function TradeHero() {
  const t = useTranslations('trade.hero')

  return (
    <section className="relative flex flex-col items-center justify-center gap-5 sm:gap-6 pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 max-w-3xl mx-auto text-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider"
      >
        <Leaf className="w-3 h-3" />
        {t('ecoBuyback')}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]"
      >
        {t('title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
      >
        {t('description')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-xl mt-1"
      >
        <TradeSearch variant="hero" />
      </motion.div>
    </section>
  )
}
