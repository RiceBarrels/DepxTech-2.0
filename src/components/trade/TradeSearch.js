"use client"

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { SearchIcon, LoaderIcon, XIcon, ImageIcon, ArrowRightIcon, Sparkles, DollarSign, Command } from 'lucide-react'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// Animated placeholder text
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
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [displayPlaceholder, setDisplayPlaceholder] = useState('')
    const [isTyping, setIsTyping] = useState(true)
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const debounceRef = useRef(null)

    // Animated placeholder typing effect
    useEffect(() => {
        if (isFocused || searchTerm) return

        const currentText = placeholderTexts[placeholderIndex]
        let charIndex = 0
        let isDeleting = false

        const typeInterval = setInterval(() => {
            if (!isDeleting) {
                if (charIndex <= currentText.length) {
                    setDisplayPlaceholder(currentText.slice(0, charIndex))
                    charIndex++
                } else {
                    setTimeout(() => {
                        isDeleting = true
                    }, 2000)
                }
            } else {
                if (charIndex > 0) {
                    charIndex--
                    setDisplayPlaceholder(currentText.slice(0, charIndex))
                } else {
                    isDeleting = false
                    setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length)
                }
            }
        }, isDeleting ? 50 : 100)

        return () => clearInterval(typeInterval)
    }, [placeholderIndex, isFocused, searchTerm])

    // Keyboard shortcuts: Escape to close, Cmd/Ctrl+K to open
    useEffect(() => {
        function handleKeydown(event) {
            // Cmd/Ctrl + K to focus search
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault()
                inputRef.current?.focus()
            }
            // Escape to close
            if (event.key === 'Escape' && isFocused) {
                closeSearch()
            }
        }

        document.addEventListener('keydown', handleKeydown)

        // Lock body scroll when focused
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

    const isHero = variant === "hero"

    return (
        <>
            {/* Placeholder to maintain layout when search is focused */}
            {isFocused && <div className={isHero ? "h-16" : "h-14"} />}

            {/* Backdrop */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
                        onClick={closeSearch}
                    >
                        {/* Floating particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-primary/20"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{
                                        y: [0, Math.random() * -200 - 100],
                                        scale: [0, 1, 0],
                                        opacity: [0, 0.6, 0]
                                    }}
                                    transition={{
                                        duration: Math.random() * 3 + 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Container */}
            <motion.div
                ref={containerRef}
                layout
                className={isFocused
                    ? "fixed top-[18vh] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
                    : "relative w-full"
                }
            >
                <motion.div layout>
                    <form onSubmit={handleSubmit}>
                        <motion.div layout className="relative">
                            {/* Animated gradient border */}
                            <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        background: isFocused
                                            ? 'conic-gradient(from 0deg, #7c3aed, #10b981, #3b82f6, #ec4899, #7c3aed)'
                                            : 'conic-gradient(from 0deg, rgba(124, 58, 237, 0.3), rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(124, 58, 237, 0.3))'
                                    }}
                                    animate={{
                                        rotate: 360
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                                {/* Blur overlay for gradient */}
                                <div className="absolute inset-0 backdrop-blur-[2px]" />
                            </div>

                            {/* Glow effect */}
                            <motion.div
                                className="absolute -inset-4 rounded-3xl opacity-0 blur-2xl pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)'
                                }}
                                animate={{
                                    opacity: isFocused ? [0.3, 0.5, 0.3] : 0
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Input wrapper */}
                            <div className="relative flex items-center bg-background rounded-2xl overflow-hidden">
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        backgroundSize: '200% 100%'
                                    }}
                                    animate={{
                                        backgroundPosition: ['200% 0', '-200% 0']
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />

                                {/* Search Icon with animation */}
                                <motion.div
                                    className="absolute left-5 pointer-events-none"
                                    animate={{
                                        scale: isFocused ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{
                                        duration: 0.3
                                    }}
                                >
                                    <SearchIcon className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                                </motion.div>

                                {/* Input */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={handleFocus}
                                    placeholder=""
                                    className={`w-full ${isHero ? 'h-16 text-lg' : 'h-14 text-base'} pl-14 pr-24 bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground`}
                                />

                                {/* Animated placeholder */}
                                {!searchTerm && !isFocused && (
                                    <div className="absolute left-14 pointer-events-none flex items-center gap-2 text-muted-foreground">
                                        <span>Search "</span>
                                        <span className="text-primary font-medium">{displayPlaceholder}</span>
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="text-primary"
                                        >
                                            |
                                        </motion.span>
                                        <span>"</span>
                                    </div>
                                )}

                                {/* Focused placeholder */}
                                {!searchTerm && isFocused && (
                                    <div className="absolute left-14 pointer-events-none text-muted-foreground/50">
                                        Type to search devices...
                                    </div>
                                )}

                                {/* Right side actions */}
                                <div className="absolute right-4 flex items-center gap-2">
                                    {loading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <LoaderIcon className="w-5 h-5 text-primary" />
                                        </motion.div>
                                    ) : searchTerm ? (
                                        <motion.button
                                            type="button"
                                            onClick={clearSearch}
                                            className="p-2 hover:bg-muted rounded-full transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <XIcon className="w-5 h-5 text-muted-foreground" />
                                        </motion.button>
                                    ) : (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                                            <Command className="w-3 h-3" />
                                            <span>K</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </form>

                    {/* Results Dropdown */}
                    <AnimatePresence>
                        {isFocused && isOpen && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <Card className="mt-4 max-h-[50vh] overflow-hidden shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl">
                                    {/* Results header */}
                                    <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {results.length} device{results.length !== 1 ? 's' : ''} found
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                Press Enter to select first
                                            </span>
                                        </div>
                                    </div>

                                    {/* Results list */}
                                    <div className="overflow-y-auto max-h-[calc(50vh-60px)] p-2">
                                        <div className="space-y-1">
                                            {results.map((product, index) => (
                                                <motion.button
                                                    key={product.id}
                                                    onClick={() => handleSelect(product.id)}
                                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all text-left group relative overflow-hidden"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ x: 4 }}
                                                >
                                                    {/* Hover gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    {/* Product Image */}
                                                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex-shrink-0 overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                                                        {product.imgs?.[0] ? (
                                                            <Image
                                                                src={product.imgs[0]}
                                                                alt={product.title}
                                                                width={56}
                                                                height={56}
                                                                className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0 relative">
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

                                                    {/* Price Badge */}
                                                    <div className="flex-shrink-0 relative">
                                                        <motion.div
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors"
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            <DollarSign className="w-4 h-4 text-green-500" />
                                                            <span className="font-bold text-green-500">
                                                                {formatPrice(product.base_price).replace('$', '')}
                                                            </span>
                                                        </motion.div>
                                                    </div>

                                                    {/* Arrow */}
                                                    <motion.div
                                                        className="flex-shrink-0"
                                                        animate={{ x: [0, 4, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        <ArrowRightIcon className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                    </motion.div>
                                                </motion.button>
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
                                <Card className="mt-4 shadow-2xl border-2 border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden">
                                    <div className="p-8 text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center"
                                        >
                                            <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                                        </motion.div>
                                        <p className="text-lg font-medium text-foreground">No devices found</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            No results for "<span className="text-primary">{searchTerm}</span>"
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-3">
                                            Try searching for a different device or{' '}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    closeSearch()
                                                    setSearchTerm('')
                                                    router.push('/trade/browse')
                                                }}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                browse all devices
                                            </button>
                                        </p>
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
