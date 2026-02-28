'use client'

import { useRouter } from '@/i18n/navigation'
import { useCallback, useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, SlidersHorizontal, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function TradeBrowseFilters({
  categories = [],
  brands = [],
  seriesList = [],
  totalCount = 0,
  categorySlug = '',
  activeBrand = '',
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('trade.browse')

  const activeFilters = [
    categorySlug && { key: 'category', label: categorySlug },
    activeBrand && { key: 'brand', label: activeBrand },
  ].filter(Boolean)

  const navigateTo = useCallback((newCategorySlug, newBrand) => {
    const parts = [newCategorySlug, newBrand ? encodeURIComponent(newBrand) : null].filter(Boolean)
    const path = `/trade/browse${parts.length > 0 ? '/' + parts.join('/') : ''}`
    startTransition(() => {
      router.push(path, { scroll: false })
    })
  }, [router, startTransition])

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push('/trade/browse', { scroll: false })
    })
  }, [router, startTransition])

  const removeFilter = useCallback((key) => {
    if (key === 'category') {
      navigateTo(null, null)
    } else if (key === 'brand') {
      navigateTo(categorySlug, null)
    }
  }, [navigateTo, categorySlug])

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={categorySlug || 'all'} onValueChange={(v) => navigateTo(v === 'all' ? null : v, null)}>
            <SelectTrigger className="h-10 w-[150px] text-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder={t('allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {brands.length > 0 && (
            <Select value={activeBrand || 'all'} onValueChange={(v) => navigateTo(categorySlug, v === 'all' ? null : v)}>
              <SelectTrigger className="h-10 w-[140px] text-sm">
                <SelectValue placeholder={t('allBrands')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allBrands')}</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Active Filters + Count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <AnimatePresence mode="popLayout">
            {activeFilters.map(({ key, label }) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Badge
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-muted"
                  onClick={() => removeFilter(key)}
                >
                  {label}
                  <X className="w-3 h-3" />
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeFilters.length > 1 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearAll}>
              {t('clearAll')}
            </Button>
          )}
        </div>

        <span className="text-sm text-muted-foreground shrink-0">
          {isPending ? (
            <span className="animate-pulse">{t('loading')}</span>
          ) : (
            t('devicesFound', { count: totalCount })
          )}
        </span>
      </div>
    </div>
  )
}
