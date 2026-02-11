'use client'

import { DollarSign, Truck, Clock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function TradeTrustIndicators() {
  const t = useTranslations('trade.trust')

  const indicators = [
    { icon: DollarSign, label: t('bestPrice'), value: t('guaranteed') },
    { icon: Truck, label: t('freeShipping'), value: t('included') },
    { icon: Clock, label: t('fastPayment'), value: t('24hours') },
    { icon: Shield, label: t('dataWiped'), value: t('certified') },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {indicators.map((item) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.label}
            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
            }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-semibold text-sm sm:text-base text-foreground">{item.value}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function TradeValueProposition() {
  const t = useTranslations('trade.valueProposition')

  return (
    <motion.div
      className="rounded-2xl bg-foreground/[0.03] border border-border p-6 md:p-8"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-foreground mb-2">{t('title')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">50K+</div>
            <div className="text-xs text-muted-foreground">{t('customers')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">4.9★</div>
            <div className="text-xs text-muted-foreground">{t('rating')}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
