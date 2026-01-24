"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    ShoppingCartIcon, 
    HeartIcon, 
    EyeIcon,
    PackageIcon,
    ChevronRightIcon,
    RefreshCwIcon,
    StarIcon,
    ZapIcon
} from 'lucide-react'
import { fetchRecommendationsServer } from "@/lib/fetch-recommends"
import { useAuth } from '@/lib/auth'
import { useTransitionRouter, isTransitionRoute } from '@/components/ui/pageTransitions'
import { usePathname } from 'next/navigation'

// Server-side component for initial render (SEO-friendly)
export default function Recommends({ 
    categories = [],
    limit = 8,
    title = "Recommended for You",
    excludeId = null,
    onProductClick,
    onAddToCart,
    onToggleFavorite,
    className = "",
    initialProducts = []
}) {
    const [products, setProducts] = useState(Array.isArray(initialProducts) ? initialProducts : [])
    const [loading, setLoading] = useState(!Array.isArray(initialProducts) || initialProducts.length === 0)
    const [error, setError] = useState(null)
    const [mounted, setMounted] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)
    const { user, addToCart } = useAuth()
    const transitionRouter = useTransitionRouter()
    const pathname = usePathname()
    
    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const navigateWithTransition = useCallback(async (href) => {
        // Set transition type before navigation
        const isTransition = isTransitionRoute(href)
        const isCurrentTransition = isTransitionRoute(pathname)
        
        if (isTransition || isCurrentTransition) {
            document.documentElement.classList.add('transition-slide')
            document.documentElement.classList.remove('transition-fade')
        } else {
            document.documentElement.classList.add('transition-fade')
            document.documentElement.classList.remove('transition-slide')
        }
        
        // Use transition router which handles view transitions
        await transitionRouter.push(href)
    }, [transitionRouter, pathname])

    const handleProductClick = useCallback(async (product) => {
        // If a custom onProductClick is provided, use it
        if (onProductClick) {
            return await onProductClick(product)
        }
        
        // Otherwise use transition router to navigate
        await navigateWithTransition(`/products/${product.id}`)
    }, [onProductClick, navigateWithTransition])

    const handleAddToCart = useCallback(async (product) => {
        // If a custom onAddToCart is provided, use it
        if (onAddToCart) {
            return await onAddToCart(product)
        }
        
        // Otherwise use the auth context
        if (!user) {
            // Redirect to login if user is not authenticated
            await navigateWithTransition('/login')
            return
        }
        
        try {
            const result = await addToCart(product.id, 1)
            if (result.success) {
                console.log('Product added to cart successfully')
            } else {
                console.error('Failed to add product to cart:', result.error)
            }
            return result
        } catch (error) {
            console.error('Error adding to cart:', error)
            return { success: false, error: error.message }
        }
    }, [onAddToCart, user, addToCart, navigateWithTransition])

    const fetchRecommendations = useCallback(async () => {
        setLoading(true)
        setError(null)
        
        try {
            const params = new URLSearchParams({
                limit: limit.toString()
            })
            
            if (excludeId) {
                params.append('excludeId', excludeId)
            }
            
            if (categories.length > 0) {
                params.append('categories', categories.join(','))
            }

            const response = await fetch(`/api/recommends?${params}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch recommendations')
            }

            setProducts(data.products || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching recommendations:', err)
        } finally {
            setLoading(false)
        }
    }, [excludeId, categories, limit])

    // Only fetch if no initial products provided (client-side only)
    useEffect(() => {
        if ((!Array.isArray(initialProducts) || initialProducts.length === 0) && mounted && !hasFetched) {
            setHasFetched(true)
            fetchRecommendations()
        }
    }, [mounted, hasFetched]) // Remove fetchRecommendations from deps to prevent infinite loop

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const getStockStatus = (stocks) => {
        if (stocks === 0) return { text: 'Out of Stock', variant: 'destructive' }
        if (stocks < 10) return { text: 'Low Stock', variant: 'warning' }
        return { text: 'In Stock', variant: 'default' }
    }

    if (loading) {
        return <RecommendsLoading title={title} limit={limit} className={className} />
    }

    if (error) {
        return (
            <div className={className}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                        <Button variant="outline" size="sm" onClick={fetchRecommendations}>
                            <RefreshCwIcon className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-red-500 py-8">
                            <p className="mb-2">Failed to load recommendations</p>
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className={className}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                        <Button variant="outline" size="sm" onClick={fetchRecommendations}>
                            <RefreshCwIcon className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-gray-500 py-8">
                            <PackageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-2">No products available</p>
                            <p className="text-sm">This could mean there are no products in the store yet, or all products are currently out of stock</p>
                            <p className="text-xs mt-2 text-gray-400">Try refreshing or check back later</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div 
            className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
        >
            <Card className="border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className={`transition-all duration-300 delay-100 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            {title}
                        </CardTitle>
                    </div>
                    <div className={`transition-all duration-300 delay-100 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                            View All
                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                mounted={mounted}
                                onProductClick={handleProductClick}
                                onAddToCart={handleAddToCart}
                                onToggleFavorite={onToggleFavorite}
                                formatPrice={formatPrice}
                                getStockStatus={getStockStatus}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ProductCard({ 
    product, 
    index,
    mounted,
    onProductClick, 
    onAddToCart, 
    onToggleFavorite, 
    formatPrice, 
    getStockStatus 
}) {
    const { title, price, stocks, category, imgs, views, rating, review_count } = product
    const stockStatus = getStockStatus(stocks)
    const mainImage = imgs && imgs.length > 0 ? imgs[0] : null
    const [isHovered, setIsHovered] = useState(false)
    const [isFavorited, setIsFavorited] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [cartMessage, setCartMessage] = useState('Add to Cart')
    const [cartError, setCartError] = useState(false)

    const handleToggleFavorite = (e) => {
        e.stopPropagation()
        setIsFavorited(!isFavorited)
        onToggleFavorite?.(product)
    }

    const handleAddToCart = async (e) => {
        e.stopPropagation()
        if (!onAddToCart || isAddingToCart || stocks === 0) return
        
        setIsAddingToCart(true)
        setCartError(false)
        
        try {
            const result = await onAddToCart(product)
            
            if (result && result.success) {
                setCartMessage('✓ Added!')
                setTimeout(() => {
                    setIsAddingToCart(false)
                    setCartMessage('Add to Cart')
                }, 1500)
            } else {
                setCartError(true)
                setCartMessage(result?.error === 'User not authenticated' ? 'Login Required' : 'Failed')
                setTimeout(() => {
                    setIsAddingToCart(false)
                    setCartMessage('Add to Cart')
                    setCartError(false)
                }, 2000)
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            setCartError(true)
            setCartMessage('Error')
            setTimeout(() => {
                setIsAddingToCart(false)
                setCartMessage('Add to Cart')
                setCartError(false)
            }, 2000)
        }
    }

    // Use actual rating from database or fallback to null
    const productRating = rating || null
    const productReviewCount = review_count || 0

    // Calculate staggered delay for smooth entrance
    const delayClass = mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
    const delayStyle = mounted ? { transitionDelay: `${index * 50}ms` } : {}

    return (
        <div
            className={`transition-all duration-500 transform ${delayClass} ${
                isHovered ? 'scale-105 -translate-y-2' : ''
            }`}
            style={delayStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card className="group rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden bg-card h-full shadow-none py-0">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Product Image */}
                    <div 
                        className="aspect-square relative overflow-hidden bg-muted"
                        onClick={() => onProductClick?.(product)}
                    >
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={title}
                                className={`w-full h-full object-cover transition-transform duration-300 ${
                                    isHovered ? 'scale-110' : 'scale-100'
                                }`}
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.svg'
                                }}
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <PackageIcon 
                                    className={`w-12 h-12 text-muted-foreground transition-transform duration-500 ${
                                        isHovered ? 'rotate-12' : 'rotate-0'
                                    }`} 
                                />
                            </div>
                        )}
                        
                        {/* Overlay Effects */}
                        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                        }`} />
                        
                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3">
                            <Badge 
                                variant={stockStatus.variant} 
                                className="text-xs shadow-md backdrop-blur-sm"
                            >
                                {stockStatus.text}
                            </Badge>
                        </div>

                        {/* Heart Icon */}
                        <div className={`absolute top-3 left-3 transition-all duration-300 ${
                            isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`bg-background/90 hover:bg-background shadow-md transition-colors duration-200 ${
                                    isFavorited ? 'text-destructive scale-110' : 'text-muted-foreground scale-100'
                                }`}
                                onClick={handleToggleFavorite}
                            >
                                <HeartIcon 
                                    className={`w-4 h-4 transition-all duration-200 ${
                                        isFavorited ? 'fill-current' : ''
                                    }`} 
                                />
                            </Button>
                        </div>

                        {/* Quick View Button */}
                        <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
                            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`}>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-background/90 hover:bg-background shadow-md text-xs"
                                onClick={() => onProductClick?.(product)}
                            >
                                <EyeIcon className="w-3 h-3 mr-1" />
                                Quick View
                            </Button>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                            <h3 
                                className={`font-semibold text-sm mb-2 hover:text-blue-600 transition-all duration-200 cursor-pointer overflow-hidden ${
                                    isHovered ? 'translate-x-1' : 'translate-x-0'
                                }`}
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis'
                                }}
                                onClick={() => onProductClick?.(product)}
                            >
                                {title}
                            </h3>
                            
                            {/* Rating - only show if rating exists */}
                            {productRating && (
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon 
                                            key={i}
                                            className={`w-3 h-3 transition-colors duration-150 ${
                                                i < productRating ? 'text-primary fill-current' : 'text-muted-foreground'
                                            }`} 
                                        />
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-1">({productReviewCount})</span>
                                </div>
                            )}
                            
                            {/* Price */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg text-primary">
                                    {formatPrice(price)}
                                </span>
                            </div>

                            {/* Categories */}
                            {category && category.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {category.slice(0, 1).map((cat, catIndex) => (
                                        <Badge 
                                            key={catIndex} 
                                            variant="outline" 
                                            className="text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                    {category.length > 2 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{category.length - 1}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Views */}
                            {views && views > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                    <EyeIcon className="w-3 h-3" />
                                    <span>{views} views</span>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <div className={`transition-transform duration-200 ${
                            isHovered ? 'scale-105' : 'scale-100'
                        }`}>
                            <Button 
                                size="sm" 
                                className="w-full relative overflow-hidden group"
                                disabled={stocks === 0 || isAddingToCart}
                                onClick={handleAddToCart}
                            >
                                <div className={`absolute inset-0 bg-primary transition-transform duration-300 ${
                                    isAddingToCart ? 'translate-x-0' : '-translate-x-full'
                                }`} />
                                
                                <div className={`flex items-center justify-center relative z-10 transition-all duration-200 ${
                                    isAddingToCart ? '-translate-y-5 opacity-0' : 'translate-y-0 opacity-100'
                                }`}>
                                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                                    {stocks === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </div>
                                
                                <div className={`absolute inset-0 flex items-center justify-center text-primary-foreground font-semibold transition-all duration-200 ${
                                    isAddingToCart ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                                }`}>
                                    ✓ Added!
                                </div>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Static loading component for better SEO
export function RecommendsLoading({ limit = 8, className = "", title = "Loading..." }) {
    return (
        <div className={className}>
            <Card className="">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-48 animate-pulse" 
                             style={{ backgroundSize: '200% 100%' }} />
                        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 animate-pulse"
                             style={{ backgroundSize: '200% 100%' }} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(limit)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <Card className="overflow-hidden border-2">
                                    <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4" />
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-3 h-3 bg-gray-200 rounded"
                                                />
                                            ))}
                                        </div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2" />
                                        <div className="flex gap-2">
                                            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16" />
                                            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16" />
                                        </div>
                                        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full" />
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}