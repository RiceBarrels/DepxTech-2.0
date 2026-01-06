"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence, motion } from "motion/react"
import { SearchIcon, Loader2, AlertCircle, ShoppingCart, Package } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { TransitionLink, useTransitionRouter } from "@/components/ui/pageTransitions"
import { ItemListStructuredData } from "@/components/seo/StructuredData"

export default function ProductsPageClient({ 
    initialProducts = [], 
    initialPagination = null,
    initialSearch = '',
    initialPage = 1
}) {
    const router = useTransitionRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    // Initialize search from URL params or props
    const [search, setSearch] = useState(initialSearch || searchParams.get('search') || "")
    const [isFocused, setIsFocused] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [products, setProducts] = useState(initialProducts)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState(initialPagination)
    const [page, setPage] = useState(initialPage)

    // Function to update URL with search params
    const updateURL = useCallback((searchTerm, pageNum = 1) => {
        const params = new URLSearchParams()
        
        if (searchTerm && searchTerm.trim()) {
            params.set('search', searchTerm.trim())
        }
        
        if (pageNum > 1) {
            params.set('page', pageNum.toString())
        }
        
        const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(newURL)
    }, [router, pathname])

    // Debounced search function
    const fetchProducts = useCallback(async (searchTerm = "", pageNum = 1) => {
        setLoading(true)
        setError(null)
        
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                page: pageNum.toString(),
                limit: '12',
                inStockOnly: 'true' // Only show in-stock products
            })
            
            const response = await fetch(`/api/products?${params}`)
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products')
            }
            
            setProducts(data.products || [])
            setPagination(data.pagination)
        } catch (err) {
            setError(err.message)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Track if we're updating URL ourselves to avoid infinite loops
    const isUpdatingURL = useRef(false)
    const prevSearchParams = useRef(searchParams.toString())

    // Only fetch if we don't have initial data (client-side navigation)
    useEffect(() => {
        const urlSearch = searchParams.get('search') || ""
        const urlPage = parseInt(searchParams.get('page')) || 1
        
        // Only fetch if URL params differ from initial props (client-side navigation)
        // This handles cases where user navigates via client-side routing
        if (urlSearch !== initialSearch || urlPage !== initialPage) {
            setSearch(urlSearch)
            setPage(urlPage)
            fetchProducts(urlSearch, urlPage)
        }
        prevSearchParams.current = searchParams.toString()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Only run on mount - initial data already provided by server

    // Sync state with URL params when they change externally (e.g., browser back/forward)
    useEffect(() => {
        const currentParams = searchParams.toString()
        
        // Skip if we just updated the URL ourselves
        if (isUpdatingURL.current) {
            isUpdatingURL.current = false
            prevSearchParams.current = currentParams
            return
        }
        
        // Skip if URL params haven't actually changed
        if (currentParams === prevSearchParams.current) {
            return
        }
        
        const urlSearch = searchParams.get('search') || ""
        const urlPage = parseInt(searchParams.get('page')) || 1
        
        // Update state from URL (external navigation like back/forward)
        setSearch(urlSearch)
        setPage(urlPage)
        fetchProducts(urlSearch, urlPage)
        prevSearchParams.current = currentParams
    }, [searchParams, fetchProducts])

    // Handle search input changes with debouncing and URL updates
    useEffect(() => {
            const timeoutId = setTimeout(() => {
            setIsSearching(search.length > 0)
                setPage(1)
            isUpdatingURL.current = true
                updateURL(search, 1)
                fetchProducts(search, 1)
            }, 300)
        
            return () => clearTimeout(timeoutId)
    }, [search, updateURL, fetchProducts])

    const handleSearch = () => {
        if (search.trim()) {
            setPage(1)
            updateURL(search.trim(), 1)
            fetchProducts(search.trim(), 1)
            setIsFocused(false)
        }
    }

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        updateURL(search, nextPage)
        fetchProducts(search, nextPage)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    return (
        <>
            {/* Structured Data for SEO */}
            {products.length > 0 && (
                <ItemListStructuredData 
                    products={products}
                    searchTerm={search}
                    currentPage={page}
                    totalItems={pagination?.totalItems}
                />
            )}

            <main className="flex flex-col items-center justify-start w-full h-full min-h-screen">
                {/* Search Header */}
                <header className="w-full">
                    <motion.div 
                        animate={isFocused ? { opacity: 1, height: "10rem" } : { opacity: 1, height: "6rem" }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                            mass: 1.5
                        }}
                        className="flex items-end justify-between w-full bg-background/50 backdrop-blur-lg rounded-b-3xl z-50 pb-3"
                        layout
                    >
                        <Input 
                            className="flex-1 text-lg h-12 rounded-full px-4 transition-all duration-300 mx-3" 
                            placeholder="Search products..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch()
                                    e.target.blur()
                                }
                            }}
                            aria-label="Search products"
                        />
                        <AnimatePresence mode="popLayout">
                            {(isSearching || loading) && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0, x: 100, y: 25, rotate: 360 }}
                                    animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0, x: 100, y: 25, rotate: 360 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 250,
                                        damping: 30,
                                        mass: 1.5
                                    }}
                                    className="flex items-center justify-center mr-3"
                                    layout
                                >
                                    <Button 
                                        size="icon" 
                                        className="size-12 rounded-full"
                                        onClick={handleSearch}
                                        disabled={loading}
                                        aria-label="Search"
                                    >
                                        {loading ? (
                                            <Loader2 className="size-5 animate-spin" />
                                        ) : (
                                            <SearchIcon strokeWidth={1.2} className="size-5 transition-all duration-300 scale-100"/>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </header>

                {/* Content */}
                <div className="p-4 w-full">
                    {/* Search Results Header */}
                    {search && !loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 w-full"
                        >
                            <h1 className="text-xl font-semibold mb-2">
                                Search results for &ldquo;{search}&rdquo;
                            </h1>
                            {pagination && (
                                <p className="text-muted-foreground">
                                    Found {pagination.totalItems} in-stock products
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Error State */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center p-8 w-full"
                            role="alert"
                        >
                            <div className="text-center">
                                <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
                                <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <Button onClick={() => fetchProducts(search, page)}>
                                    Try Again
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Products Grid */}
                    {!error && (
                        <section 
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full"
                            aria-label="Products"
                        >
                            <AnimatePresence mode="popLayout">
                                {products.map((product, index) => (
                                    <motion.article
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <TransitionLink href={`/products/${product.id}`}>
                                            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group p-0 gap-0 h-full">
                                                <CardHeader className="p-0">
                                                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                                                        {product.imgs && product.imgs.length > 0 ? (
                                                            <img 
                                                                src={product.imgs[0]} 
                                                                alt={product.title}
                                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 rounded-xl"
                                                                loading={index < 10 ? "eager" : "lazy"}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none'
                                                                    e.target.nextSibling.style.display = 'flex'
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div 
                                                            className={`absolute inset-0 bg-muted flex items-center justify-center ${product.imgs && product.imgs.length > 0 ? 'hidden' : 'flex'}`}
                                                            style={{ display: product.imgs && product.imgs.length > 0 ? 'none' : 'flex' }}
                                                            aria-hidden="true"
                                                        >
                                                            <Package className="size-12 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <CardTitle className="text-sm line-clamp-2 mb-2 h-8 w-full text-ellipsis">
                                                        {product.title}
                                                    </CardTitle>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-bold" aria-label={`Price: ${formatPrice(product.price)}`}>
                                                                {formatPrice(product.price)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground" aria-label={`${product.stocks} items in stock`}>
                                                                {product.stocks} in stock
                                                            </span>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                            aria-label={`Add ${product.title} to cart`}
                                                        >
                                                            <ShoppingCart className="size-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TransitionLink>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </section>
                    )}

                    {/* Empty State */}
                    {!loading && !error && products.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center p-8 text-center"
                        >
                            <div>
                                <SearchIcon className="size-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                                <h2 className="text-lg font-semibold mb-2">
                                    {search ? 'No in-stock products found' : 'No in-stock products available'}
                                </h2>
                                <p className="text-muted-foreground">
                                    {search 
                                        ? `Try adjusting your search terms or check back later.`
                                        : 'Check back later for new products in stock.'
                                    }
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Load More Button */}
                    {!loading && !error && pagination && pagination.hasNextPage && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mt-8"
                        >
                            <Button 
                                variant="outline" 
                                onClick={handleLoadMore}
                                className="min-w-32"
                            >
                                Load More
                            </Button>
                        </motion.div>
                    )}

                    {/* Loading State for Load More */}
                    {loading && products.length > 0 && (
                        <div className="flex justify-center mt-8" aria-label="Loading more products">
                            <Loader2 className="size-6 animate-spin" />
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
