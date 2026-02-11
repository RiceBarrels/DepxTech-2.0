'use client'

import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
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
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('trade.browse')

  const activeCategory = searchParams.get('category') || ''
  const activeBrand = searchParams.get('brand') || ''
  const activeSeries = searchParams.get('series') || ''
  const activeQuery = searchParams.get('q') || ''

  const activeFilters = [
    activeCategory && { key: 'category', label: activeCategory },
    activeBrand && { key: 'brand', label: activeBrand },
    activeSeries && { key: 'series', label: activeSeries },
  ].filter(Boolean)

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Clear dependent filters when a parent changes
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
  }, [searchParams, router])

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push('/trade/browse', { scroll: false })
    })
  }, [router])

  const removeFilter = useCallback((key) => {
    updateParam(key, '')
  }, [updateParam])

  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter') {
      updateParam('q', e.target.value.trim())
    }
  }, [updateParam])

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            defaultValue={activeQuery}
            onKeyDown={handleSearch}
            onBlur={(e) => {
              if (e.target.value !== activeQuery) {
                updateParam('q', e.target.value.trim())
              }
            }}
            className="pl-9 h-10"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={activeCategory || 'all'} onValueChange={(v) => updateParam('category', v)}>
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
            <Select value={activeBrand || 'all'} onValueChange={(v) => updateParam('brand', v)}>
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

          {seriesList.length > 0 && (
            <Select value={activeSeries || 'all'} onValueChange={(v) => updateParam('series', v)}>
              <SelectTrigger className="h-10 w-[140px] text-sm">
                <SelectValue placeholder={t('allSeries')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSeries')}</SelectItem>
                {seriesList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
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
