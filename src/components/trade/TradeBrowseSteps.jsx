'use client'

import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ChevronRight, X, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransitionLink } from '@/components/ui/pageTransitions'
import TradeBrandCard from './TradeBrandCard'
import { TradeProductCard } from './TradeCards'
import { heavyHapticsImpact, mediumHapticsImpact } from '@/lib/haptics'

const categoryImages = {
  'Smartphones': '/stockImg/tradein-cata-img/Smartphone.png',
  'Laptops': '/stockImg/tradein-cata-img/Laptop.png',
  'Tablets': '/stockImg/tradein-cata-img/Tablet.png',
  'Gaming': '/stockImg/tradein-cata-img/Gaming.png',
  'Wearables': '/stockImg/tradein-cata-img/Wearable.png',
  'Processors': '/stockImg/tradein-cata-img/CPU.png',
  'Graphics Cards': '/stockImg/tradein-cata-img/GPU.png',
  'Memory': '/stockImg/tradein-cata-img/RAM.png',
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function TradeBrowseSteps({
  category,
  brand,
  series,
  brands,
  seriesList,
  products,
  autoSkip,
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('trade.browse')

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Clear downstream params
    if (key === 'category') {
      params.delete('brand')
      params.delete('series')
    }
    if (key === 'brand') {
      params.delete('series')
    }

    startTransition(() => {
      router.push(`/trade/browse?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, router, startTransition])

  // Auto-skip when only 1 option
  useEffect(() => {
    if (autoSkip.brand && !brand) {
      updateParam('brand', autoSkip.brand)
    }
  }, [autoSkip.brand, brand, updateParam])

  useEffect(() => {
    if (autoSkip.series && !series) {
      updateParam('series', autoSkip.series)
    }
  }, [autoSkip.series, series, updateParam])

  const seriesSkipped = autoSkip.seriesSkipped || seriesList.length === 0
  const showProducts = category && brand && (seriesSkipped || series)
  const tc = useTranslations('trade.categories')

  // Map category DB name to i18n key
  const categoryI18nKey = {
    'Smartphones': 'smartphone',
    'Laptops': 'laptop',
    'Tablets': 'tablet',
    'Gaming': 'gaming',
    'Wearables': 'wearable',
    'Processors': 'cpu',
    'Graphics Cards': 'gpu',
    'Memory': 'ram',
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      {category && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl bg-muted/60 border border-border"
        >
          <div className="flex items-center gap-4 sm:gap-6 px-5 sm:px-8 py-4 sm:py-5">
            {categoryImages[category] && (
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 shrink-0">
                <Image
                  src={categoryImages[category]}
                  alt={category}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {tc(categoryI18nKey[category] || 'smartphone')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {tc(`${categoryI18nKey[category] || 'smartphone'}Desc`)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        {category && (
          <>
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-muted"
              onClick={() => updateParam('category', '')}
            >
              {category}
              <X className="w-3 h-3" />
            </Badge>
            {(brand || !brand) && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </>
        )}
        {brand && (
          <>
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-muted"
              onClick={() => updateParam('brand', '')}
            >
              {brand}
              <X className="w-3 h-3" />
            </Badge>
            {(series || (!seriesSkipped && !series)) && (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </>
        )}
        {series && (
          <Badge
            variant="secondary"
            className="gap-1 pr-1 cursor-pointer hover:bg-muted"
            onClick={() => updateParam('series', '')}
          >
            {series}
            <X className="w-3 h-3" />
          </Badge>
        )}
        {isPending && (
          <span className="text-sm text-muted-foreground animate-pulse ml-2">
            {t('loading')}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* No category — prompt to go back */}
        {!category && (
          <motion.div
            key="no-category"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center py-16"
          >
            <h2 className="text-2xl font-bold mb-3">{t('title')}</h2>
            <p className="text-muted-foreground mb-6">{t('selectCategoryHint')}</p>
            <TransitionLink href="/trade">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('browseCategoriesBtn')}
              </Button>
            </TransitionLink>
          </motion.div>
        )}

        {/* Step 1: Brand selection — card grid */}
        {category && !brand && (
          <motion.section
            key="brand-step"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h2 className="text-xl font-bold mb-6">{t('selectBrand')}</h2>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
            >
              {brands.map((b) => (
                <motion.div key={b.name} variants={itemVariants}>
                  <TradeBrandCard
                    name={b.name}
                    img={b.img}
                    onClick={() => updateParam('brand', b.name)}
                    onTouchStart={() => {
                      heavyHapticsImpact()
                      setTimeout(() => {
                        mediumHapticsImpact()
                      }, 250)
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
            {brands.length === 0 && (
              <p className="text-muted-foreground text-center py-8">{t('noProductsFound')}</p>
            )}
          </motion.section>
        )}

        {/* Step 2: Series selection — dropdown */}
        {brand && !seriesSkipped && !series && (
          <motion.section
            key="series-step"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h2 className="text-xl font-bold mb-4">{t('selectSeries')}</h2>
            <Select onValueChange={(v) => updateParam('series', v)}>
              <SelectTrigger className="w-full max-w-sm h-12 text-base">
                <SelectValue placeholder={t('chooseSeries')} />
              </SelectTrigger>
              <SelectContent>
                {seriesList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.section>
        )}

        {/* Step 3: Product / model grid */}
        {showProducts && (
          <motion.section
            key="products-step"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('selectModel')}</h2>
              <span className="text-sm text-muted-foreground">
                {t('devicesFound', { count: products.length })}
              </span>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                {products.map((product, i) => (
                  <TradeProductCard
                    key={product.id}
                    product={product}
                    href={`/trade/product/${product.id}`}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-semibold text-foreground mb-1">{t('noProductsFound')}</p>
                <p className="text-sm text-muted-foreground">{t('noProductsHint')}</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
