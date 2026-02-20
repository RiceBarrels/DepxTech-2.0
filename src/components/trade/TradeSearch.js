"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { SearchIcon, LoaderIcon, XIcon, ImageIcon, ArrowRightIcon, Sparkles, DollarSign, Command } from 'lucide-react'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const placeholderTexts = [
    "iPhone 15 Pro Max",
    "MacBook Pro M3",
    "Samsung Galaxy S24",
    "iPad Pro 12.9",
    "PlayStation 5",
    "Apple Watch Ultra",
    "RTX 4090",
    "ThinkPad X1 Carbon"
]

export default function TradeSearch({ variant = "default" }) {
    const router = useTransitionRouter()
    const t = useTranslations('trade.search')
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef(null)
    const debounceRef = useRef(null)

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeydown(event) {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault()
                inputRef.current?.focus()
            }
            if (event.key === 'Escape' && isFocused) {
                closeSearch()
            }
        }
        document.addEventListener('keydown', handleKeydown)
        if (isFocused) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.removeEventListener('keydown', handleKeydown)
            document.body.style.overflow = ''
        }
    }, [isFocused])

    const closeSearch = useCallback(() => {
        setIsFocused(false)
        setIsOpen(false)
        inputRef.current?.blur()
    }, [])

    // Search with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!searchTerm || searchTerm.length < 2) {
            setResults([])
            setIsOpen(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/trade/search?q=${encodeURIComponent(searchTerm)}`)
                const data = await response.json()
                if (response.ok) {
                    setResults(data.products || [])
                    setIsOpen(true)
                }
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [searchTerm])

    const handleSelect = useCallback((productId) => {
        closeSearch()
        setSearchTerm('')
        router.push(`/trade/product/${productId}`)
    }, [closeSearch, router])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (results.length > 0) handleSelect(results[0].id)
    }

    const clearSearch = () => {
        setSearchTerm('')
        setResults([])
        setIsOpen(false)
        inputRef.current?.focus()
    }

    const handleFocus = () => {
        setIsFocused(true)
        if (results.length > 0) setIsOpen(true)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0)
    }

    const isHero = variant === "hero"

    return (
        <>
            <style jsx>{`
                @keyframes placeholder-cycle {
                    ${placeholderTexts.map((text, i) => {
                        const pct = (i / placeholderTexts.length) * 100
                        const next = ((i + 1) / placeholderTexts.length) * 100
                        const mid = pct + (next - pct) * 0.7
                        return `${pct}% { content: "${text}"; opacity: 1; } ${mid}% { opacity: 1; } ${next - 0.1}% { opacity: 0; }`
                    }).join('\n')}
                    100% { content: "${placeholderTexts[0]}"; opacity: 1; }
                }
                .search-placeholder::after {
                    content: "${placeholderTexts[0]}";
                    animation: placeholder-cycle ${placeholderTexts.length * 3}s steps(1) infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .search-cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes gradient-spin {
                    to { --gradient-angle: 360deg; }
                }
                @property --gradient-angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }
                .search-border {
                    background: conic-gradient(from var(--gradient-angle), rgba(124,58,237,0.3), rgba(16,185,129,0.3), rgba(59,130,246,0.3), rgba(236,72,153,0.3), rgba(124,58,237,0.3));
                    animation: gradient-spin 4s linear infinite;
                }
                .search-border-focused {
                    background: conic-gradient(from var(--gradient-angle), #7c3aed, #10b981, #3b82f6, #ec4899, #7c3aed);
                    animation: gradient-spin 4s linear infinite;
                }
                @keyframes search-expand {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0) scale(1);
                    }
                }
                .search-focused {
                    animation: search-expand 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes result-slide-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .result-item {
                    animation: result-slide-in 0.25s ease-out both;
                }
                .result-item:nth-child(1) { animation-delay: 0ms; }
                .result-item:nth-child(2) { animation-delay: 40ms; }
                .result-item:nth-child(3) { animation-delay: 80ms; }
                .result-item:nth-child(4) { animation-delay: 120ms; }
                .result-item:nth-child(5) { animation-delay: 160ms; }
                .result-item:nth-child(n+6) { animation-delay: 200ms; }
            `}</style>

            {isFocused && <div className={isHero ? "h-16" : "h-14"} />}

            {/* Backdrop */}
            {isFocused && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-md z-999 animate-in fade-in duration-200"
                    onClick={closeSearch}
                />
            )}

            {/* Search Container */}
            <div
                className={isFocused
                    ? "fixed top-[18vh] left-1/2 w-full max-w-2xl px-4 z-999 search-focused"
                    : "relative w-full"
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        {/* CSS gradient border */}
                        <div className={`absolute -inset-[2px] rounded-2xl ${isFocused ? 'search-border-focused' : 'search-border'}`} />

                        {/* Input wrapper */}
                        <div className="relative flex items-center bg-background rounded-2xl overflow-hidden">
                            <div className="absolute left-5 pointer-events-none">
                                <SearchIcon className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>

                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={handleFocus}
                                placeholder=""
                                className={`w-full ${isHero ? 'h-16 text-lg' : 'h-14 text-base'} pl-14 pr-24 bg-transparent border-none outline-none focus:ring-0 text-foreground`}
                            />

                            {/* CSS-only animated placeholder */}
                            {!searchTerm && !isFocused && (
                                <div className="absolute left-14 pointer-events-none flex items-center gap-1 text-muted-foreground">
                                    <span>{t('prefix')}</span>
                                    <span className="text-primary font-medium search-placeholder" />
                                    <span className="text-primary search-cursor">|</span>
                                    <span>{t('suffix')}</span>
                                </div>
                            )}

                            {!searchTerm && isFocused && (
                                <div className="absolute left-14 pointer-events-none text-muted-foreground/50">
                                    {t('placeholder')}
                                </div>
                            )}

                            {/* Right actions */}
                            <div className="absolute right-4 flex items-center gap-2">
                                {loading ? (
                                    <LoaderIcon className="w-5 h-5 text-primary animate-spin" />
                                ) : searchTerm ? (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <XIcon className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                                        <Command className="w-3 h-3" />
                                        <span>K</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Results Dropdown */}
                {isFocused && isOpen && results.length > 0 && (
                    <Card className="mt-4 max-h-[50vh] overflow-hidden shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        {t('devicesFound', { count: results.length })}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {t('pressEnter')}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(50vh-60px)] p-2">
                            <div className="space-y-1">
                                {results.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSelect(product.id)}
                                        className="result-item w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 hover:-translate-y-px hover:shadow-sm transition-all duration-200 text-left group"
                                    >
                                        <div className="relative w-14 h-14 rounded-xl bg-muted shrink-0 overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                                            {product.imgs?.[0] ? (
                                                <Image
                                                    src={product.imgs[0]}
                                                    alt={product.title}
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate group-hover:text-primary transition-colors">
                                                {product.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                <span className="font-medium">{product.brand}</span>
                                                {product.category && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                        <span>{product.category}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors shrink-0">
                                            <DollarSign className="w-4 h-4 text-green-500" />
                                            <span className="font-bold text-green-500">
                                                {formatPrice(product.base_price).replace('$', '')}
                                            </span>
                                        </div>

                                        <ArrowRightIcon className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {/* No Results */}
                {isFocused && isOpen && searchTerm.length >= 2 && results.length === 0 && !loading && (
                    <Card className="mt-4 shadow-2xl border-2 border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-lg font-medium text-foreground">{t('noDevicesFound')}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('noResultsFor', { term: searchTerm })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-3">
                                {t('trySearching')}{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        closeSearch()
                                        setSearchTerm('')
                                        router.push('/trade/browse')
                                    }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    {t('browseAllDevices')}
                                </button>
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </>
    )
}
