'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, DollarSign, Sparkles } from 'lucide-react'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Brand Card for category page
export function TradeBrandCard({ brand, brandImg, href, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <TransitionLink href={href} className="block group">
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 transition-colors"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* Hover gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Shimmer effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Brand Logo */}
            <div className="relative w-20 h-20 mb-4">
              {brandImg ? (
                <motion.div
                  className="w-full h-full"
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Image
                    src={brandImg}
                    alt={brand}
                    fill
                    className="object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center"
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-300">
                    {brand.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Brand Name */}
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
              {brand}
            </h3>

            {/* Arrow indicator */}
            <motion.div
              className="mt-3 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ x: isHovered ? 4 : 0 }}
            >
              <span>Select</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Bottom border accent */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </TransitionLink>
    </motion.div>
  )
}

// Series Card for brand page
export function TradeSeriesCard({ series, href, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <TransitionLink href={href} className="block group">
        <motion.div
          className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 transition-colors"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ x: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* Hover background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Series indicator */}
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  'bg-slate-100 dark:bg-slate-700 group-hover:bg-primary/10 transition-colors'
                )}
                animate={{ rotate: isHovered ? 5 : 0 }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>

              <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {series}
              </h3>
            </div>

            <motion.div
              className="flex items-center gap-2 text-primary"
              animate={{ x: isHovered ? 4 : 0 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Left border accent */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-emerald-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </TransitionLink>
    </motion.div>
  )
}

// Product Card for series page - clean minimal design
export function TradeProductCard({ product, href, index = 0 }) {
  const price = product.base_price || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <TransitionLink href={href} className="block group h-full">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-full hover:border-primary/50 hover:shadow-lg transition-all duration-200">
          {/* Product Image */}
          <div className="relative p-4">
            <div className="relative w-full aspect-square rounded-xl bg-slate-50 dark:bg-slate-700/50 overflow-hidden">
              {product.imgs && product.imgs.length > 0 && (
                <div className="relative w-full h-full p-4 group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src={product.imgs[0]}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Price badge */}
              <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm">
                ${price.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-4 pb-4 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </h3>
              {product.des && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                  {product.des}
                </p>
              )}
            </div>

            {/* Trade value */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500">Trade-in up to</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${price.toFixed(2)}
              </span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary group-hover:text-primary/80">
              <span>Get Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </TransitionLink>
    </motion.div>
  )
}
