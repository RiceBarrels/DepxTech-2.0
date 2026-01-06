"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
    ShoppingCartIcon, 
    CreditCardIcon, 
    LockIcon,
    ArrowLeftIcon,
    Loader2,
    CheckCircle,
    AlertCircle,
    ZapIcon,
    TicketPercentIcon,
    XIcon,
    PlusIcon
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { TransitionLink } from "@/components/ui/pageTransitions"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { loadStripe } from '@stripe/stripe-js'
import {
    Elements,
    CardElement,
    PaymentRequestButtonElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Express Checkout Component
function ExpressCheckout({ cartTotal, cartItems, onPaymentSuccess }) {
    const stripe = useStripe()
    const { user, clearCart } = useAuth()
    const [paymentRequest, setPaymentRequest] = useState(null)
    const [canMakePayment, setCanMakePayment] = useState(false)

    useEffect(() => {
        if (stripe) {
            const pr = stripe.paymentRequest({
                country: 'US',
                currency: 'usd',
                total: {
                    label: 'Total',
                    amount: Math.round(cartTotal * 100),
                },
                requestPayerName: true,
                requestPayerEmail: true,
                requestShipping: true,
            })

            // Check if payment request is available
            pr.canMakePayment().then(result => {
                setCanMakePayment(!!result)
            })

            pr.on('paymentmethod', async (ev) => {
                try {
                    // Create payment intent on the server
                    const response = await fetch('/api/stripe/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: Math.round(cartTotal * 100),
                            currency: 'usd',
                            cartItems: cartItems,
                            billingDetails: {
                                name: ev.payerName,
                                email: ev.payerEmail,
                                address: ev.shippingAddress ? {
                                    line1: ev.shippingAddress.addressLine[0] || '',
                                    city: ev.shippingAddress.city || '',
                                    state: ev.shippingAddress.region || '',
                                    postal_code: ev.shippingAddress.postalCode || '',
                                    country: ev.shippingAddress.country || 'US'
                                } : {
                                    line1: '',
                                    city: '',
                                    state: '',
                                    postal_code: '',
                                    country: 'US'
                                }
                            }
                        }),
                    })

                    const { client_secret, error: serverError } = await response.json()

                    if (serverError) {
                        ev.complete('fail')
                        throw new Error(serverError)
                    }

                    // Confirm payment
                    const { error, paymentIntent } = await stripe.confirmCardPayment(
                        client_secret,
                        { payment_method: ev.paymentMethod.id },
                        { handleActions: false }
                    )

                    if (error) {
                        ev.complete('fail')
                        throw new Error(error.message)
                    }

                    ev.complete('success')

                    if (paymentIntent.status === 'requires_action') {
                        const { error: confirmError } = await stripe.confirmCardPayment(client_secret)
                        if (confirmError) {
                            throw new Error(confirmError.message)
                        }
                    }

                    // Save transaction to database
                    const transactionResponse = await fetch('/api/stripe/save-transaction', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            paymentIntentId: paymentIntent.id,
                            amount: cartTotal,
                            cartItems: cartItems,
                            billingDetails: {
                                name: ev.payerName,
                                email: ev.payerEmail,
                                address: ev.shippingAddress ? {
                                    line1: ev.shippingAddress.addressLine[0] || '',
                                    city: ev.shippingAddress.city || '',
                                    state: ev.shippingAddress.region || '',
                                    postal_code: ev.shippingAddress.postalCode || '',
                                    country: ev.shippingAddress.country || 'US'
                                } : {
                                    line1: '',
                                    city: '',
                                    state: '',
                                    postal_code: '',
                                    country: 'US'
                                }
                            },
                            status: 'completed',
                            order_status: 'processing'
                        }),
                    })

                    const transactionResult = await transactionResponse.json()

                    if (transactionResult.success) {
                        await clearCart()
                        onPaymentSuccess(paymentIntent, transactionResult.transaction)
                        toast.success('Express payment successful! Order confirmed.')
                    } else {
                        throw new Error('Payment succeeded but failed to save transaction')
                    }

                } catch (err) {
                    console.error('Express payment error:', err)
                    toast.error(`Express payment failed: ${err.message}`)
                }
            })

            setPaymentRequest(pr)
        }
    }, [stripe, cartTotal, cartItems, onPaymentSuccess])

    if (!canMakePayment) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <ZapIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Express Checkout</h3>
            </div>
            <PaymentRequestButtonElement 
                options={{ paymentRequest }}
                className="mb-4"
            />
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or pay with card
                    </span>
                </div>
            </div>
        </div>
    )
}

// Payment Form Component
function CheckoutForm({ cartTotal, cartItems, onPaymentSuccess, appliedOffers = [], offerDiscounts = {} }) {
    const stripe = useStripe()
    const elements = useElements()
    const { user, clearCart } = useAuth()
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState(null)
    const [billingDetails, setBillingDetails] = useState({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        address: {
            line1: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US'
        }
    })

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsProcessing(true)
        setPaymentStatus(null)

        try {
            // Create payment intent on the server
            const response = await fetch('/api/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(cartTotal * 100), // Convert to cents
                    currency: 'usd',
                    cartItems: cartItems,
                    billingDetails: billingDetails
                }),
            })

            const { client_secret, error: serverError } = await response.json()

            if (serverError) {
                throw new Error(serverError)
            }

            // Confirm payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: billingDetails,
                }
            })

            if (error) {
                throw new Error(error.message)
            }

            if (paymentIntent.status === 'succeeded') {
                // Save transaction to database
                const transactionResponse = await fetch('/api/stripe/save-transaction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        amount: cartTotal,
                        cartItems: cartItems,
                        billingDetails: billingDetails,
                        status: 'completed',
                        order_status: 'processing'
                    }),
                })

                const transactionResult = await transactionResponse.json()

                if (transactionResult.success) {
                    // Clear cart after successful payment
                    await clearCart()
                    setPaymentStatus('success')
                    onPaymentSuccess(paymentIntent, transactionResult.transaction)
                    toast.success('Payment successful! Order confirmed.')
                } else {
                    throw new Error('Payment succeeded but failed to save transaction')
                }
            }
        } catch (err) {
            console.error('Payment error:', err)
            setPaymentStatus('error')
            toast.error(`Payment failed: ${err.message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBillingChange = (field, value) => {
        if (field.includes('address.')) {
            const addressField = field.split('.')[1]
            setBillingDetails(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }))
        } else {
            setBillingDetails(prev => ({
                ...prev,
                [field]: value
            }))
        }
    }

    return (
        <div className="space-y-6">
            {/* Express Checkout */}
            <ExpressCheckout 
                cartTotal={cartTotal}
                cartItems={cartItems}
                onPaymentSuccess={onPaymentSuccess}
            />

            {/* Regular Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Billing Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Billing Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={billingDetails.name}
                                onChange={(e) => handleBillingChange('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={billingDetails.email}
                                onChange={(e) => handleBillingChange('email', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={billingDetails.address.line1}
                            onChange={(e) => handleBillingChange('address.line1', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={billingDetails.address.city}
                                onChange={(e) => handleBillingChange('address.city', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={billingDetails.address.state}
                                onChange={(e) => handleBillingChange('address.state', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="postal_code">ZIP Code</Label>
                            <Input
                                id="postal_code"
                                value={billingDetails.address.postal_code}
                                onChange={(e) => handleBillingChange('address.postal_code', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Information</h3>
                    <div className="p-4 border rounded-lg">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Payment Status */}
                {paymentStatus === 'success' && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">Payment successful!</span>
                    </div>
                )}

                {paymentStatus === 'error' && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800">Payment failed. Please try again.</span>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing || paymentStatus === 'success'}
                    className="w-full"
                    size="lg"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Payment...
                        </>
                    ) : (
                        <>
                            <LockIcon className="w-4 h-4 mr-2" />
                            Pay ${cartTotal.toFixed(2)}
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}

// Main Checkout Component
export default function CheckoutPage() {
    const { user, getCart } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [orderDetails, setOrderDetails] = useState(null)
    const [appliedOffers, setAppliedOffers] = useState([])
    const [offerDiscounts, setOfferDiscounts] = useState({})
    const [promoCode, setPromoCode] = useState('')
    const [applyingPromo, setApplyingPromo] = useState(false)
    const [validatingOffers, setValidatingOffers] = useState(false)
    const router = useTransitionRouter()

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
        if (user) {
            fetchCartData()
        } else {
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

    const fetchCartData = async () => {
        setLoading(true)
        try {
            const cartResult = await getCart()
            if (cartResult.success && cartResult.cart.length > 0) {
                setCartItems(cartResult.cart)
                
                // Fetch product details
                const productPromises = cartResult.cart.map(async (item) => {
                    const response = await fetch(`/api/products?id=${item.productId}`)
                    const data = await response.json()
                    return {
                        ...data.products[0],
                        cartAmount: parseInt(item.amount)
                    }
                })
                
                const productDetails = await Promise.all(productPromises)
                const validProducts = productDetails.filter(Boolean)
                setProducts(validProducts)
            } else {
                setCartItems([])
                setProducts([])
            }
        } catch (error) {
            console.error('Error fetching cart data:', error)
            toast.error('Failed to load cart')
        } finally {
            setLoading(false)
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

    const applyPromoCode = async () => {
        if (!promoCode.trim()) {
            toast.error('Please enter a promo code')
            return
        }

        setApplyingPromo(true)
        try {
            const cartTotal = calculateSubtotal()
            const cartItems = products.map(p => ({
                id: p.id,
                category: p.category,
                price: p.price
            }))

            const response = await fetch('/api/offers/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    offerCode: promoCode.trim(),
                    cartTotal: cartTotal,
                    cartItems: cartItems
                })
            })

            const data = await response.json()

            if (data.success) {
                // Check if already applied
                if (appliedOffers.find(o => o.id === data.offer.id)) {
                    toast.info('This offer is already applied')
                } else {
                    const newOffers = [...appliedOffers, data.offer]
                    setAppliedOffers(newOffers)
                    
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('appliedOffers', JSON.stringify(newOffers))
                    }
                    
                    toast.success('Promo code applied successfully!')
                    setPromoCode('')
                }
            } else {
                toast.error(data.error || 'Invalid promo code')
            }
        } catch (error) {
            console.error('Error applying promo code:', error)
            toast.error('Failed to apply promo code')
        } finally {
            setApplyingPromo(false)
        }
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

    const handlePaymentSuccess = (paymentIntent, transaction) => {
        setPaymentSuccess(true)
        setOrderDetails({
            paymentIntent,
            transaction,
            total: calculateTotal(),
            items: products
        })
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <LockIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold mb-2">Please Login</h2>
                        <p className="text-muted-foreground mb-4">You need to be logged in to checkout</p>
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
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-4">Add some products to proceed to checkout</p>
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

    if (paymentSuccess) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <h2 className="text-2xl font-bold mb-2 text-green-800">Payment Successful!</h2>
                        <p className="text-muted-foreground mb-6">Thank you for your order. You will receive a confirmation email shortly.</p>
                        
                        <div className=" p-4 rounded-lg mb-6">
                            <h3 className="font-semibold mb-2">Order Summary</h3>
                            <p className="text-sm text-muted-foreground">Order ID: {orderDetails?.transaction?.id}</p>
                            <p className="text-sm text-muted-foreground">Total: {formatPrice(orderDetails?.total || 0)}</p>
                            <p className="text-sm text-muted-foreground">Items: {orderDetails?.items?.length || 0}</p>
                        </div>

                        <div className="flex gap-4">
                            <TransitionLink href="/products" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </TransitionLink>
                            <TransitionLink href="/account" className="flex-1">
                                <Button className="w-full">
                                    View Orders
                                </Button>
                            </TransitionLink>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <TransitionLink href="/cart">
                        <Button variant="outline" size="icon">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        </Button>
                    </TransitionLink>
                    <h1 className="text-2xl font-bold">Checkout</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {products.map((product) => (
                                <div key={product.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.imgs && product.imgs[0] ? (
                                            <Image
                                                src={product.imgs[0]}
                                                alt={product.title}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingCartIcon className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{product.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {formatPrice(product.price)} × {product.cartAmount}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {formatPrice(product.price * product.cartAmount)}
                                    </div>
                                </div>
                            ))}
                            
                            <Separator />

                            {/* Promo Code Input */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Promo Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={applyPromoCode}
                                        disabled={applyingPromo || !promoCode.trim()}
                                        size="icon"
                                    >
                                        {applyingPromo ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <PlusIcon className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
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
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Form */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Elements stripe={stripePromise}>
                                <CheckoutForm
                                    cartTotal={calculateTotal()}
                                    cartItems={cartItems}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    appliedOffers={appliedOffers}
                                    offerDiscounts={offerDiscounts}
                                />
                            </Elements>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
