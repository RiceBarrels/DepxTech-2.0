'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
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
        <div className="relative flex flex-row sm:flex-col overflow-hidden bg-muted rounded-2xl bg-card border border-border h-full hover:border-primary/50 hover:shadow-lg transition-all duration-200">
          {/* Product Image */}
          <div className="relative p-0 sm:p-0">
            <div className="relative w-32 sm:w-full aspect-square border-b p-4">
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
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                ${price.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 sm:flex-1 px-3 sm:px-4 sm:pb-2 space-y-2 sm:space-y-3 bg-background">
            <div className="pt-4">
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {product.title}
              </h3>
            </div>

            {/* Trade value */}
            <div className="flex flex-col sm:h-auto sm:flex-row items-start pb-4">
              <span className="text-xs text-muted-foreground pr-2">
                {t('startsAt')}
              </span>
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-md">
                  ${price.toFixed(2).split('.')[0]}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  .{price.toFixed(2).split('.')[1]}
                </span>
              </div>
              <div className='flex-1'/>
              <div className="text-sm text-muted-foreground flex items-center gap-0.5 sm:pl-2">
                <Eye className="h-3 w-3" />{product.views}
              </div>
            </div>
          </div>
        </div>
      </TransitionLink>
    </motion.div>
  )
}
