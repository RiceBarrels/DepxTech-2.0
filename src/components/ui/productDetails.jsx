import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
    ShoppingCartIcon, 
    HeartIcon, 
    ShareIcon, 
    EditIcon, 
    TrashIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PackageIcon,
    DollarSignIcon,
    TagIcon
} from 'lucide-react'
import { ImageGallery } from './ImageGallery'
import { ProductActions } from './ProductActions'
import { VariantSelector } from './VariantSelector'

export default function ProductDetails({ 
    product, 
    onEdit, 
    onDelete, 
    onAddToCart,
    onToggleFavorite,
    onShare,
    isAdmin = false,
    className = "" 
}) {
    if (!product) {
        return (
            <Card className={`w-full max-w-4xl mx-auto ${className}`}>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-gray-500">No product data available</div>
                </CardContent>
            </Card>
        )
    }

    const {
        title = '',
        des = '',
        price = 0,
        stocks = 0,
        category = [],
        imgs = [],
        variant_of_id = '',
        variant_data = [],
        views = 0,
        id
    } = product

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

    const stockStatus = getStockStatus(stocks)

    return (
        <div className={`w-full max-w-6xl mx-auto ${className}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <ImageGallery images={imgs} title={title} />

                {/* Product Information */}
                <div className="space-y-6">
                    <div className='flex flex-col py-8'>
                        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                        
                        {/* Price and Stock */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                                <span className="text-3xl font-bold text-green-600">
                                    {formatPrice(price)}
                                </span>
                            </div>
                            <Badge variant={stockStatus.variant}>
                                {stockStatus.text}
                            </Badge>
                            {stocks > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {stocks} available
                                </span>
                            )}
                        </div>

                        {/* Categories */}
                        {category.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <TagIcon className="w-4 h-4 text-gray-500" />
                                <div className="flex flex-wrap gap-1">
                                    {category.map((cat, index) => (
                                        <Badge key={index} variant="outline">
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Views */}
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                            <EyeIcon className="w-4 h-4" />
                            <span>{views} views</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    {des && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-foreground/80 leading-relaxed">{des}</p>
                        </div>
                    )}

                    {/* Variants */}
                    {variant_data && variant_data.length > 0 && variant_data[0].variant_type && (
                        <VariantSelector variants={variant_data} />
                    )}

                    {/* Variant Parent Info */}
                    {variant_of_id && (
                        <div>
                            <Badge variant="secondary">
                                Variant of product ID: {variant_of_id}
                            </Badge>
                        </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <ProductActions
                        product={product}
                        isAdmin={isAdmin}
                        stocks={stocks}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddToCart={onAddToCart}
                        onToggleFavorite={onToggleFavorite}
                    />

                    {/* Product ID (for admin) */}
                    {isAdmin && id && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                            Product ID: {id}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Loading component
export function ProductDetailsLoading({ className = "" }) {
    return (
        <div className={`w-full max-w-6xl mx-auto ${className}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Skeleton */}
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            <div className="aspect-square w-full bg-gray-200 animate-pulse rounded-lg" />
                        </CardContent>
                    </Card>
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
                        ))}
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
                        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-4/6" />
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 bg-gray-200 animate-pulse rounded flex-1" />
                        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded" />
                        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Error component
export function ProductDetailsError({ error, onRetry, className = "" }) {
    return (
        <Card className={`w-full max-w-4xl mx-auto ${className}`}>
            <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-red-500 text-center">
                    <h3 className="text-lg font-semibold mb-2">Error Loading Product</h3>
                    <p className="text-sm">{error}</p>
                </div>
                {onRetry && (
                    <Button onClick={onRetry} variant="outline">
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
