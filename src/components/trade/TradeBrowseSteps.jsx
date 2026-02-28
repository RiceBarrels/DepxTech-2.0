'use client'

import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useParams } from 'next/navigation'
import { useCallback, useTransition, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight, X, SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function TradeBrowseSteps({
  categoryName,
  categorySlug,
  brand,
  seriesList = [],
  autoSkip,
  children,
}) {
  const router = useTransitionRouter()
  const { locale } = useParams()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('trade.browse')

  const [filterQuery, setFilterQuery] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('all')

  const navigateTo = useCallback((newCategorySlug, newBrand) => {
    const parts = [newCategorySlug, newBrand ? encodeURIComponent(newBrand) : null].filter(Boolean)
    const path = `/${locale}/trade/browse${parts.length > 0 ? '/' + parts.join('/') : ''}`
    startTransition(() => {
      router.push(path)
    })
  }, [router, startTransition, locale])

  // Auto-skip when only 1 option
  useEffect(() => {
    if (autoSkip?.brand && !brand) {
      navigateTo(categorySlug, autoSkip.brand)
    }
  }, [autoSkip?.brand, brand, navigateTo, categorySlug])

  // Redirect to /trade if no category selected
  useEffect(() => {
    if (!categoryName) {
      document.documentElement.classList.add('transition-fade')
      document.documentElement.classList.remove('transition-slide')
      startTransition(() => {
        router.push(`/${locale}/trade`)
      })
    }
  }, [categoryName, router, startTransition, locale])

  // Client-side filtering: hide product cards via data attributes
  useEffect(() => {
    if (!brand) return
    const container = document.getElementById('trade-product-grid')
    if (!container) return

    const cards = container.querySelectorAll('[data-product-card]')
    const q = filterQuery.toLowerCase().trim()

    cards.forEach((card) => {
      const title = (card.getAttribute('data-title') || '').toLowerCase()
      const series = card.getAttribute('data-series') || ''

      const matchesQuery = !q || title.includes(q)
      const matchesSeries = selectedSeries === 'all' || series === selectedSeries

      card.style.display = matchesQuery && matchesSeries ? '' : 'none'
    })
  }, [filterQuery, selectedSeries, brand])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        {categoryName && (
          <>
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-muted"
              onClick={() => navigateTo(null, null)}
            >
              {categoryName}
              <X className="w-3 h-3" />
            </Badge>
            {brand && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </>
        )}
        {brand && (
          <Badge
            variant="secondary"
            className="gap-1 pr-1 cursor-pointer hover:bg-muted"
            onClick={() => navigateTo(categorySlug, null)}
          >
            {brand}
            <X className="w-3 h-3" />
          </Badge>
        )}
        {isPending && (
          <span className="text-sm text-muted-foreground animate-pulse ml-2">
            {t('loading')}
          </span>
        )}
      </div>

      {/* Search & Series Filter (only when products are shown) */}
      {categoryName && brand && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-9 pl-9 text-sm"
            />
          </div>
          {seriesList.length > 0 && (
            <Select value={selectedSeries} onValueChange={setSelectedSeries}>
              <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                <SelectValue placeholder={t('seriesLabel')} />
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
      )}

      {/* Server-rendered content passed as children */}
      {children}
    </div>
  )
}
