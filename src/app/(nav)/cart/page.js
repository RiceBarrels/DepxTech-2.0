"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
    ShoppingCartIcon, 
    TrashIcon, 
    MinusIcon, 
    PlusIcon,
    PackageIcon,
    DollarSignIcon,
    CreditCardIcon,
    ArrowLeftIcon,
    Loader2,
    TicketPercentIcon,
    XIcon
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import CartLoading from "./loading"
import { TransitionLink } from "@/components/ui/pageTransitions"

export default function CartPage() {
    const { user, getCart, updateCartItemAmount, clearCart } = useAuth()
    
    // Initialize fast cart data immediately
    const initializeFastCart = () => {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
            return {
                products: [],
                inputValues: {},
                loading: true,
                isFastCartLoaded: false
            }
        }
        
        try {
            const fastCart = localStorage.getItem('fastCart')
            if (fastCart && fastCart !== 'undefined' && fastCart !== 'null') {
                const parsedCart = JSON.parse(fastCart)
                if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                    // Initialize input values with fast cart amounts
                    const initialInputValues = {}
                    parsedCart.forEach(product => {
                        initialInputValues[product.id] = product.cartAmount
                    })
                    console.log("fastcart loaded:",parsedCart)
                    return {
                        products: parsedCart,
                        inputValues: initialInputValues,
                        loading: false,
                        isFastCartLoaded: true
                    }
                }
            }
        } catch (error) {
            console.error('Error loading fast cart:', error)
            // Clear invalid fastCart data
            if (typeof window !== 'undefined') {
                localStorage.removeItem('fastCart')
            }
        }
        return {
            products: [],
            inputValues: {},
            loading: true,
            isFastCartLoaded: false
        }
    }

    const initialState = initializeFastCart()
    
    const [products, setProducts] = useState(initialState.products)
    const [loading, setLoading] = useState(initialState.loading)
    const [updating, setUpdating] = useState({})
    const [inputValues, setInputValues] = useState(initialState.inputValues)
    const [swipeStates, setSwipeStates] = useState({})
    const [isFastCartLoaded, setIsFastCartLoaded] = useState(initialState.isFastCartLoaded)
    const [isCloudFetched, setIsCloudFetched] = useState(false)
    const [appliedOffers, setAppliedOffers] = useState([])
    const [offerDiscounts, setOfferDiscounts] = useState({})
    const [validatingOffers, setValidatingOffers] = useState(false)

    useEffect(() => {
        // Load applied offers from localStorage
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('appliedOffers')
                if (saved) {
                    const offers = JSON.parse(saved)
                    setAppliedOffers(offers)
                }
            } catch (error) {
                console.error('Error loading applied offers:', error)
            }
        }
    }, [])

    useEffect(() => {
        // If user is logged in, fetch cloud data
        if (user) {
            fetchCartData()
        } else {
            // For non-logged in users, ensure loading is false
            setLoading(false)
        }
    }, [user])

    // Validate and calculate discounts for applied offers
    useEffect(() => {
        if (appliedOffers.length > 0 && products.length > 0) {
            validateOffers()
        } else {
            setOfferDiscounts({})
        }
    }, [appliedOffers, products])



    const saveFastCart = (productsToSave) => {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
            return
        }
        
        try {
            if (Array.isArray(productsToSave) && productsToSave.length > 0) {
                localStorage.setItem('fastCart', JSON.stringify(productsToSave))
            } else {
                localStorage.removeItem('fastCart')
            }
        } catch (error) {
            console.error('Error saving fast cart:', error)
        }
    }

    useEffect(() => {
        // Save to fast cart whenever products change (but not on initial load from fast cart)
        if (isFastCartLoaded) {
            saveFastCart(products)
        }
    }, [products, isFastCartLoaded])

    const fetchCartData = async () => {
        // Only show loading if we don't have fast cart data
        if (!isFastCartLoaded) {
            setLoading(true)
        }
        try {
            // Get cart items
            const cartResult = await getCart()
            if (cartResult.success && cartResult.cart.length > 0) {
                
                // Fetch product details for each cart item
                const productPromises = cartResult.cart.map(async (item) => {
                    try {
                        const response = await fetch(`/api/products?id=${item.productId}`)
                        const data = await response.json()
                        
                        // Check if data.products exists and has items
                        if (data && data.products && data.products.length > 0) {
                            return {
                                ...data.products[0],
                                cartAmount: parseInt(item.amount)
                            }
                        } else {
                            console.warn(`Product not found for ID: ${item.productId}`)
                            return null
                        }
                    } catch (error) {
                        console.error(`Error fetching product ${item.productId}:`, error)
                        return null
                    }
                })
                
                const productDetails = await Promise.all(productPromises)
                const validProducts = productDetails.filter(product => product !== null)
                
                // Only update products if fastCart is not loaded or if cloud data is different
                if (!isFastCartLoaded || validProducts.length === 0) {
                    setProducts(validProducts)
                    setIsCloudFetched(true)
                    
                    // Initialize input values with current cart amounts
                    const initialInputValues = {}
                    validProducts.forEach(product => {
                        initialInputValues[product.id] = product.cartAmount
                    })
                    setInputValues(initialInputValues)
                } else {
                    // If fastCart is loaded, just mark as cloud fetched but don't override products
                    setIsCloudFetched(true)
                }
                
                // Mark fast cart as loaded after server data is fetched
                setIsFastCartLoaded(true)
            } else {
                // Only clear products if fastCart is not loaded
                if (!isFastCartLoaded) {
                    setProducts([])
                    setInputValues({})
                }
                setIsCloudFetched(true)
                setIsFastCartLoaded(true)
            }
        } catch (error) {
            console.error('Error fetching cart data:', error)
            toast.error('Failed to load cart')
        } finally {
            setLoading(false)
        }
    }

    const updateQuantity = async (productId, newAmount) => {
        if (newAmount < 1) return
        
        setUpdating(prev => ({ ...prev, [productId]: true }))
        try {
            const result = await updateCartItemAmount(productId, newAmount)
                         if (result.success) {
                 // Update local state
                 setProducts(prev => prev.map(product => 
                     product.id === productId 
                         ? { ...product, cartAmount: newAmount }
                         : product
                 ))
                 // Update input values
                 setInputValues(prev => ({ ...prev, [productId]: newAmount }))
                 toast.success('Cart updated')
            } else {
                toast.error('Failed to update cart')
            }
        } catch (error) {
            console.error('Error updating cart:', error)
            toast.error('Failed to update cart')
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }))
        }
    }

    const removeItem = async (productId) => {
        setUpdating(prev => ({ ...prev, [productId]: true }))
        try {
            const result = await updateCartItemAmount(productId, 0)
                         if (result.success) {
                 setProducts(prev => prev.filter(product => product.id !== productId))
                 // Remove from input values
                 setInputValues(prev => {
                     const { [productId]: removed, ...rest } = prev
                     return rest
                 })
                 toast.success('Item removed from cart')
            } else {
                toast.error('Failed to remove item')
            }
        } catch (error) {
            console.error('Error removing item:', error)
            toast.error('Failed to remove item')
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }))
        }
    }

    const handleClearCart = async () => {
        try {
            const result = await clearCart()
                         if (result.success) {
                 setProducts([])
                 setInputValues({})
                 toast.success('Cart cleared')
            } else {
                toast.error('Failed to clear cart')
            }
        } catch (error) {
            console.error('Error clearing cart:', error)
            toast.error('Failed to clear cart')
        }
    }

    const validateOffers = async () => {
        if (appliedOffers.length === 0 || products.length === 0) return
        
        setValidatingOffers(true)
        const cartTotal = calculateSubtotal()
        const cartItems = products.map(p => ({
            id: p.id,
            category: p.category,
            price: p.price
        }))

        const discountMap = {}
        
        for (const offer of appliedOffers) {
            try {
                const response = await fetch('/api/offers/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        offerCode: offer.code,
                        cartTotal: cartTotal,
                        cartItems: cartItems
                    })
                })

                const data = await response.json()
                
                if (data.success) {
                    discountMap[offer.id] = {
                        discount: data.discount,
                        offer: offer
                    }
                } else {
                    // Remove invalid offer
                    removeAppliedOffer(offer.id)
                    toast.error(`Offer "${offer.title}" is no longer valid: ${data.error}`)
                }
            } catch (error) {
                console.error('Error validating offer:', error)
            }
        }
        
        setOfferDiscounts(discountMap)
        setValidatingOffers(false)
    }

    const removeAppliedOffer = (offerId) => {
        const newOffers = appliedOffers.filter(offer => offer.id !== offerId)
        setAppliedOffers(newOffers)
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('appliedOffers', JSON.stringify(newOffers))
        }
    }

    const calculateSubtotal = () => {
        return products.reduce((total, product) => {
            return total + (product.price * product.cartAmount)
        }, 0)
    }

    const calculateTotalDiscount = () => {
        return Object.values(offerDiscounts).reduce((total, offerData) => {
            return total + (offerData.discount || 0)
        }, 0)
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        const discount = calculateTotalDiscount()
        return Math.max(0, subtotal - discount)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const handleInputChange = (productId, value) => {
        setInputValues(prev => ({ ...prev, [productId]: value }))
    }

    const handleInputBlur = (productId, maxStock) => {
        const inputValue = inputValues[productId]
        const newAmount = parseInt(inputValue) || 1
        
        // Validate the amount
        if (newAmount < 1) {
            setInputValues(prev => ({ ...prev, [productId]: 1 }))
            updateQuantity(productId, 1)
        } else if (newAmount > maxStock) {
            setInputValues(prev => ({ ...prev, [productId]: maxStock }))
            updateQuantity(productId, maxStock)
        } else {
            // Only update if the value actually changed
            const currentAmount = products.find(p => p.id === productId)?.cartAmount
            if (newAmount !== currentAmount) {
                updateQuantity(productId, newAmount)
            }
        }
    }

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur() // Trigger onBlur to save the value
        }
    }

    const handleSwipeStart = (productId, e) => {
        const touch = e.touches[0]
        setSwipeStates(prev => ({
            ...prev,
            [productId]: {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                isDragging: false,
                startTime: Date.now()
            }
        }))
    }

    const handleSwipeMove = (productId, e) => {
        e.preventDefault()
        const touch = e.touches[0]
        const swipeState = swipeStates[productId]
        
        if (!swipeState) return

        const deltaX = touch.clientX - swipeState.startX
        const deltaY = touch.clientY - swipeState.startY
        
        // Only start dragging if horizontal movement is greater than vertical
        if (!swipeState.isDragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            setSwipeStates(prev => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    isDragging: true
                }
            }))
        }

        if (swipeState.isDragging) {
            setSwipeStates(prev => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    currentX: touch.clientX
                }
            }))
        }
    }

    const handleSwipeEnd = (productId, e) => {
        const swipeState = swipeStates[productId]
        
        if (!swipeState) return

        const deltaX = swipeState.currentX - swipeState.startX
        const deltaTime = Date.now() - swipeState.startTime
        const velocity = Math.abs(deltaX) / deltaTime
        
        // Trigger delete if swipe distance is significant or velocity is high
        const shouldDelete = Math.abs(deltaX) > 100 || (Math.abs(deltaX) > 50 && velocity > 0.3)
        
        if (swipeState.isDragging && shouldDelete) {
            removeItem(productId)
            toast.success('Item removed from cart')
        }

        // Reset swipe state
        setSwipeStates(prev => {
            const { [productId]: removed, ...rest } = prev
            return rest
        })
    }

    const getSwipeTransform = (productId) => {
        const swipeState = swipeStates[productId]
        if (!swipeState || !swipeState.isDragging) return 'translateX(0px)'
        
        const deltaX = swipeState.currentX - swipeState.startX
        const clampedDeltaX = Math.max(-150, Math.min(150, deltaX))
        return `translateX(${clampedDeltaX}px)`
    }

    const getSwipeOpacity = (productId) => {
        const swipeState = swipeStates[productId]
        if (!swipeState || !swipeState.isDragging) return 1
        
        const deltaX = Math.abs(swipeState.currentX - swipeState.startX)
        return Math.max(0.3, 1 - (deltaX / 200))
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold mb-2">Please Login</h2>
                        <p className="text-muted-foreground mb-4">You need to be logged in to view your cart</p>
                        <TransitionLink href="/login">
                            <Button>Login</Button>
                        </TransitionLink>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <CartLoading/>
        )
    }

    if (products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-4">Add some products to get started</p>
                        <TransitionLink href="/products">
                            <Button>
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </TransitionLink>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Shopping Cart</h1>
                <Badge variant="outline">
                    {products.length} item{products.length > 1 ? 's' : ''}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {products.map((product) => (
                        <div key={product.id} className="relative overflow-hidden">
                            {/* Delete Background */}
                            <div className="absolute inset-0 bg-red-500 flex items-center justify-center rounded-4xl">
                                <TrashIcon className="w-8 h-8 text-white" />
                                <span className="text-white font-medium ml-2">Swipe to remove</span>
                            </div>
                            
                            <Card 
                                className="relative"
                                style={{
                                    transform: getSwipeTransform(product.id),
                                    opacity: getSwipeOpacity(product.id),
                                    transition: swipeStates[product.id]?.isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out'
                                }}
                                onTouchStart={(e) => handleSwipeStart(product.id, e)}
                                onTouchMove={(e) => handleSwipeMove(product.id, e)}
                                onTouchEnd={(e) => handleSwipeEnd(product.id, e)}
                            >
                                <CardContent className="">
                                    <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                            {product.imgs && product.imgs[0] ? (
                                                <Image
                                                    src={product.imgs[0]}
                                                    alt={product.title}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <PackageIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate mb-1">
                                            {product.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {formatPrice(product.price)} each
                                        </p>
                                        
                                        {/* Stock Info */}
                                        <div className="flex items-center gap-2 mb-3">
                                            {product.stocks > 0 ? (
                                                <Badge variant="default" className="text-xs">
                                                    {product.stocks} in stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="text-xs">
                                                    Out of stock
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                onClick={() => updateQuantity(product.id, product.cartAmount - 1)}
                                                disabled={product.cartAmount <= 1 || updating[product.id]}
                                            >
                                                <MinusIcon className="w-4 h-4" />
                                            </Button>
                                            
                                            <Input
                                                type="number"
                                                value={inputValues[product.id] || product.cartAmount}
                                                onChange={(e) => handleInputChange(product.id, e.target.value)}
                                                onBlur={() => handleInputBlur(product.id, product.stocks)}
                                                onKeyDown={(e) => handleInputKeyDown(e)}
                                                className="w-16 text-center"
                                                max={product.stocks}
                                            />
                                            
                                            <Button
                                                size="icon"
                                                onClick={() => updateQuantity(product.id, product.cartAmount + 1)}
                                                disabled={product.cartAmount >= product.stocks || updating[product.id]}
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => removeItem(product.id)}
                                                disabled={updating[product.id]}
                                                className="ml-auto"
                                            >
                                                {updating[product.id] ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <TrashIcon className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="text-right">
                                        <p className="font-semibold text-lg">
                                            {formatPrice(product.price * product.cartAmount)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                    ))}

                    {/* Clear Cart Button */}
                    <div className="pt-4">
                        <Button 
                            variant="outline" 
                            onClick={handleClearCart}
                            className="w-full"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Clear Cart
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {products.map((product) => (
                                    <div key={product.id} className="flex justify-between text-sm">
                                        <span className="truncate mr-2">
                                            {product.title} × {product.cartAmount}
                                        </span>
                                        <span>{formatPrice(product.price * product.cartAmount)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Applied Offers */}
                            {appliedOffers.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Applied Offers:</p>
                                        {appliedOffers.map((offer) => {
                                            const offerData = offerDiscounts[offer.id]
                                            return (
                                                <div key={offer.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <TicketPercentIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-green-800 truncate">{offer.title}</p>
                                                                {offer.code && (
                                                                    <p className="text-xs text-green-600 font-mono">{offer.code}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {validatingOffers ? (
                                                            <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                                                        ) : offerData ? (
                                                            <span className="text-sm font-semibold text-green-700">
                                                                -{formatPrice(offerData.discount)}
                                                            </span>
                                                        ) : null}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                                                            onClick={() => removeAppliedOffer(offer.id)}
                                                        >
                                                            <XIcon className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                            
                            <Separator />
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(calculateSubtotal())}</span>
                                </div>
                                {calculateTotalDiscount() > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatPrice(calculateTotalDiscount())}</span>
                                    </div>
                                )}
                            </div>
                            
                            <Separator />
                            
                            <div className="flex justify-between items-center font-semibold text-lg">
                                <span>Total</span>
                                <span>{formatPrice(calculateTotal())}</span>
                            </div>

                            <div className="flex flex-col space-y-2 pt-4">
                                <TransitionLink href="/checkout" disabled={!isCloudFetched}>
                                    <Button className="w-full" disabled={!isCloudFetched}>
                                        {isCloudFetched ? (
                                            <CreditCardIcon className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        {isCloudFetched ? "Proceed to Checkout" : "Loading Checkout..."}
                                    </Button>
                                </TransitionLink>
                                <TransitionLink href="/products">
                                    <Button variant="outline" className="w-full">
                                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                        Continue Shopping
                                    </Button>
                                </TransitionLink>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}