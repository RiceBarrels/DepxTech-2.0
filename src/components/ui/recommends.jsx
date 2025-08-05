"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    ShoppingCartIcon, 
    HeartIcon, 
    EyeIcon,
    PackageIcon,
    DollarSignIcon,
    ChevronRightIcon,
    RefreshCwIcon
} from 'lucide-react'

export default function Recommends({ 
    categories = [],
    limit = 8,
    title = "Recommended for You",
    excludeId = null,
    onProductClick,
    onAddToCart,
    onToggleFavorite,
    className = ""
}) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRecommendations = async () => {
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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommends?${params}`)
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
    }

    useEffect(() => {
        fetchRecommendations()
    }, [excludeId, categories.join(','), limit])

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
        <div className={className}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                        View All
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={onProductClick}
                                onAddToCart={onAddToCart}
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
    onProductClick, 
    onAddToCart, 
    onToggleFavorite, 
    formatPrice, 
    getStockStatus 
}) {
    const { title, price, stocks, category, imgs, views, id } = product
    const stockStatus = getStockStatus(stocks)
    const mainImage = imgs && imgs.length > 0 ? imgs[0] : null

    return (
        <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardContent className="p-0">
                {/* Product Image */}
                <div 
                    className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100"
                    onClick={() => onProductClick?.(product)}
                >
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.svg'
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <PackageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    
                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2">
                        <Badge variant={stockStatus.variant} className="text-xs">
                            {stockStatus.text}
                        </Badge>
                    </div>

                    {/* Heart Icon */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 left-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite?.(product)
                        }}
                    >
                        <HeartIcon className="w-4 h-4" />
                    </Button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <div className="mb-2">
                        <h3 
                            className="font-semibold text-sm line-clamp-2 mb-1 hover:text-blue-600 transition-colors"
                            onClick={() => onProductClick?.(product)}
                        >
                            {title}
                        </h3>
                        
                        {/* Price */}
                        <div className="flex items-center gap-1 mb-2">
                            <DollarSignIcon className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">
                                {formatPrice(price)}
                            </span>
                        </div>

                        {/* Categories */}
                        {category && category.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {category.slice(0, 2).map((cat, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {cat}
                                    </Badge>
                                ))}
                                {category.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{category.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Views */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <EyeIcon className="w-3 h-3" />
                            <span>{views || 0} views</span>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button 
                        size="sm" 
                        className="w-full"
                        disabled={stocks === 0}
                        onClick={(e) => {
                            e.stopPropagation()
                            onAddToCart?.(product)
                        }}
                    >
                        <ShoppingCartIcon className="w-4 h-4 mr-2" />
                        {stocks === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Loading component
export function RecommendsLoading({ title = "Recommended for You", limit = 8, className = "" }) {
    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 animate-pulse rounded w-48" />
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-20" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(limit)].map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <div className="aspect-square bg-gray-200 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                                    <div className="flex gap-2">
                                        <div className="h-5 bg-gray-200 animate-pulse rounded w-16" />
                                        <div className="h-5 bg-gray-200 animate-pulse rounded w-16" />
                                    </div>
                                    <div className="h-8 bg-gray-200 animate-pulse rounded w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
