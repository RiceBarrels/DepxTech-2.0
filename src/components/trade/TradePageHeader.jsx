'use client'

import { motion } from 'framer-motion'
import { Sparkles, Building2, LayoutList, Smartphone, Layers } from 'lucide-react'
import TradeSearch from '@/components/trade/TradeSearch'

const iconMap = {
  sparkles: Sparkles,
  building: Building2,
  layout: LayoutList,
  smartphone: Smartphone,
  layers: Layers,
}

export function TradePageHeader({
  title,
  subtitle,
  showSearch = true,
  step,
  icon = 'sparkles'
}) {
  const Icon = iconMap[icon] || Sparkles
  return (
    <div className="text-center mb-12">
      {/* Step indicator badge */}
      {step && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          <Icon className="w-4 h-4" />
          <span>Step {step}</span>
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {subtitle}
      </motion.p>

      {/* Search */}
      {showSearch && (
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TradeSearch />
        </motion.div>
      )}
    </div>
  )
}
