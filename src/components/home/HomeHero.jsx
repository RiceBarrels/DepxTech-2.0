'use client'

import Image from 'next/image'
import { Spotlight } from '@/components/ui/aceternity/spotlight'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import { motion } from 'framer-motion'
import TradeSearch from '@/components/trade/TradeSearch'
import {
  Leaf,
  BadgeCheck,
  DollarSign,
} from 'lucide-react'
import { FlipWords } from '../ui/flip-words'
import { useTranslations } from 'next-intl'

export function HomeHero() {
  const t = useTranslations('home.hero')
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="oklch(0.5393 0.2713 286.7462 / 0.3)"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 sm:gap-6 md:gap-8"
          >
            {/* Eco Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider w-fit"
            >
              <Leaf className="w-3.5 h-3.5" />
              {t('badge')}
            </motion.div>

            {/* Headline with TextGenerateEffect */}
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              <TextGenerateEffect
                words={t('headline1')}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight"
                filter={false}
                duration={0.3}
              />
              <FlipWords words={t.raw('flipWords')} className="text-primary" />{t('headline2')}
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed"
            >
              {t('subheadline')}
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <TradeSearch variant="hero" />
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-4 text-sm text-slate-500"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                {t('trustScore')}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="font-medium">{t('devicesRecycled')}</span>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Main Card */}
            <div className="relative bg-slate-100 dark:bg-slate-800 rounded-[2rem] p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-700">
              <div className="aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                <Image
                  src="/stockImg/iphone_17_pro_max.png"
                  alt={t('imageAlt')}
                  width={300}
                  height={300}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t('averagePayoutLabel')}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{t('averagePayoutValue')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
