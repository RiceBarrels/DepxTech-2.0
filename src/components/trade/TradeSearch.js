"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { SearchIcon, LoaderIcon, XIcon, ImageIcon, ArrowRightIcon } from 'lucide-react'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function TradeSearch() {
    const router = useTransitionRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const debounceRef = useRef(null)

    // Close on escape key and lock body scroll
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                closeSearch()
            }
        }
        if (isFocused) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isFocused])

    const closeSearch = () => {
        setIsFocused(false)
        setIsOpen(false)
        inputRef.current?.blur()
    }

    // Search products with debounce
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

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

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [searchTerm])

    const handleSelect = (productId) => {
        closeSearch()
        setSearchTerm('')
        router.push(`/trade/product/${productId}`)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (results.length > 0) {
            handleSelect(results[0].id)
        }
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

    return (
        <>
            {/* Placeholder to maintain layout when search is focused */}
            {isFocused && <div className="h-14" />}

            {/* Backdrop */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={closeSearch}
                    />
                )}
            </AnimatePresence>

            {/* Search Container */}
            <motion.div
                ref={containerRef}
                layout
                className={isFocused
                    ? "fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
                    : "relative w-full"
                }
            >
                <motion.div layout>
                    <form onSubmit={handleSubmit}>
                        <motion.div layout className="relative flex items-center">
                            <SearchIcon className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <Input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={handleFocus}
                                placeholder="Search for a device to sell..."
                                className="w-full h-14 pl-12 pr-12 text-lg rounded-xl border-2 focus:border-primary bg-background"
                            />
                            {loading ? (
                                <LoaderIcon className="absolute right-4 w-5 h-5 animate-spin text-muted-foreground" />
                            ) : searchTerm ? (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-4 p-1 hover:bg-muted rounded-full transition-colors"
                                >
                                    <XIcon className="w-5 h-5 text-muted-foreground" />
                                </button>
                            ) : isFocused ? (
                                <button
                                    type="button"
                                    onClick={closeSearch}
                                    className="absolute right-4 p-1 hover:bg-muted rounded-full transition-colors"
                                >
                                    <XIcon className="w-5 h-5 text-muted-foreground" />
                                </button>
                            ) : null}
                        </motion.div>
                    </form>

                    {/* Results Dropdown */}
                    <AnimatePresence>
                        {isFocused && isOpen && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="mt-3 max-h-[50vh] overflow-y-auto shadow-2xl border-2">
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground px-2 py-1">
                                            {results.length} product{results.length !== 1 ? 's' : ''} found
                                        </p>
                                        <div className="space-y-1">
                                            {results.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleSelect(product.id)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors text-left group"
                                                >
                                                    {/* Product Image */}
                                                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                                        {product.imgs?.[0] ? (
                                                            <Image
                                                                src={product.imgs[0]}
                                                                alt={product.title}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                                                            {product.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>{product.brand}</span>
                                                            {product.category && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span>{product.category}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex-shrink-0 text-right">
                                                        <p className="font-bold text-green-600">
                                                            up to {formatPrice(product.base_price)}
                                                        </p>
                                                    </div>

                                                    <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* No Results */}
                    <AnimatePresence>
                        {isFocused && isOpen && searchTerm.length >= 2 && results.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="mt-3 shadow-2xl border-2">
                                    <div className="p-6 text-center">
                                        <p className="text-muted-foreground">No products found for "{searchTerm}"</p>
                                        <p className="text-sm text-muted-foreground mt-1">Try a different search term or browse categories below</p>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </>
    )
}
