'use client'

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { useTranslations } from 'next-intl'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Package } from 'lucide-react'

export function RecentlyViewed({ excludeId }) {
  const { items } = useRecentlyViewed()
  const t = useTranslations('recentlyViewed')

  const filtered = items.filter((item) => item.id !== excludeId)
  if (filtered.length === 0) return null

  return (
    <section className="py-6">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {filtered.map((item) => (
          <TransitionLink
            key={item.id}
            href={`/products/${item.id}`}
            className="shrink-0 w-32 group"
          >
            <div className="aspect-square rounded-xl bg-muted overflow-hidden mb-2">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="size-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
              {item.title}
            </p>
            {item.price != null && (
              <p className="text-xs text-muted-foreground">${item.price}</p>
            )}
          </TransitionLink>
        ))}
      </div>
    </section>
  )
}
