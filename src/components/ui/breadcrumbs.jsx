'use client'

import { Link } from '@/i18n/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm text-muted-foreground py-3', className)}>
      <Link href="/" className="hover:text-foreground transition-colors shrink-0">
        <Home className="size-3.5" />
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="size-3 shrink-0" />
          {i === items.length - 1 ? (
            <span className="text-foreground font-medium truncate">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition-colors truncate">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
