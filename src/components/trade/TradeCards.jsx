'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { useTranslations } from 'next-intl'

// Product Card — used on browse page and landing page
export function TradeProductCard({ product, href, index = 0 }) {
  const t = useTranslations('trade.browse')
  const price = product.base_price || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
    >
      <TransitionLink href={href} className="block group h-full">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border h-full hover:border-primary/50 hover:shadow-lg transition-all duration-200">
          {/* Product Image */}
          <div className="relative p-3 sm:p-4">
            <div className="relative w-full aspect-square rounded-xl bg-muted overflow-hidden">
              {product.imgs && product.imgs.length > 0 && (
                <div className="relative w-full h-full p-3 sm:p-4 group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src={product.imgs[0]}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Price badge */}
              <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                ${price.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </h3>
              {product.des && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {product.des}
                </p>
              )}
            </div>

            {/* Trade value */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
              <span className="text-xs sm:text-sm text-muted-foreground">{t('tradeInUpTo')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                ${price.toFixed(2)}
              </span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary group-hover:text-primary/80">
              <span>{t('getQuote')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </TransitionLink>
    </motion.div>
  )
}
