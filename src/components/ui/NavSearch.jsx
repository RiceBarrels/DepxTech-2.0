'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SearchIcon, XIcon, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useTransitionRouter } from './pageTransitions'
import { useTranslations } from 'next-intl'
import { Input } from './input'

export function NavSearch({ className }) {
    const router = useTransitionRouter()
    const t = useTranslations('trade.search')
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)
    const inputRef = useRef(null)
    const debounceRef = useRef(null)

    // Close on click outside
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!query || query.length < 2) {
            setResults([])
            setOpen(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/trade/search?q=${encodeURIComponent(query)}&limit=6`)
                const data = await res.json()
                if (res.ok) {
                    setResults(data.products || [])
                    setOpen(true)
                }
            } catch {
                // ignore
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [query])

    const handleSelect = useCallback((id) => {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
        router.push(`/trade/product/${id}`)
    }, [router])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (results.length > 0) handleSelect(results[0].id)
    }

    const formatPrice = (price) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price || 0)

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setOpen(true) }}
                    placeholder={t('placeholder')}
                    className="w-full h-10 px-10 text-base sm:text-sm bg-muted/50 border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                />
                {loading ? (
                    <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground animate-spin" />
                ) : query ? (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
                    >
                        <XIcon className="size-3.5 text-muted-foreground" />
                    </button>
                ) : null}
            </form>

            {/* Dropdown results */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-[360px] overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="py-1">
                            {results.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelect(product.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="size-10 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50">
                                        {product.imgs?.[0] ? (
                                            <Image
                                                src={product.imgs[0]}
                                                alt={product.title}
                                                width={40}
                                                height={40}
                                                className="size-full object-contain p-0.5"
                                            />
                                        ) : (
                                            <div className="size-full flex items-center justify-center">
                                                <ImageIcon className="size-4 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{product.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {product.brand}{product.category ? ` / ${product.category}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                        {formatPrice(product.base_price)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 && !loading ? (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            {t('noDevicesFound')}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
