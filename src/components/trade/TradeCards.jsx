'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

// Calculate maximum trade-in value based on questions
function calculateUpToValue(product) {
  const basePrice = product.base_price || 0
  const questions = product.questions || []

  // Debug: log product data to verify structure
  if (process.env.NODE_ENV === 'development') {
    console.log('Product:', {
      title: product.title,
      base_price: basePrice,
      hasQuestions: questions.length > 0,
      questions
    })
  }

  // If no questions, return base price
  if (questions.length === 0) return basePrice

  // Calculate maximum value by selecting the highest-value option for each question
  const totalPercentage = questions.reduce((total, question) => {
    const answers = question.ans || []
    if (answers.length === 0) return total

    // For "opposite_multiple" type, best case is selecting none (0%)
    if (question.type === 'opposite_multiple') {
      return total
    }

    // For other types, find the answer with the highest percentage
    const maxPercentage = answers.reduce((max, answer) => {
      // Parse percentage string: "+6", "12", "-30", "" → 6, 12, -30, 0
      const percentStr = (answer.persentage || '').trim()
      if (percentStr === '') return max

      const percent = parseFloat(percentStr.replace('+', ''))
      return isNaN(percent) ? max : Math.max(max, percent)
    }, 0)

    return total + maxPercentage
  }, 0)

  // Calculate final value: base price + (base price * total percentage / 100)
  const totalValue = basePrice + (basePrice * totalPercentage / 100)

  if (process.env.NODE_ENV === 'development') {
    console.log('Calculated upTo:', { basePrice, totalPercentage, totalValue })
  }

  return totalValue
}

// Product Card — used on browse page and landing page
export function TradeProductCard({ product, href, index = 0 }) {
  const t = useTranslations('trade.browse')
  const upToPrice = calculateUpToValue(product)

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
                ${upToPrice.toFixed(0)}
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
                {t('upTo')}
              </span>
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-md">
                  ${upToPrice.toFixed(2).split('.')[0]}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  .{upToPrice.toFixed(2).split('.')[1]}
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
