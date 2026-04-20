"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    PlusIcon,
    TruckIcon,
    MapPinIcon,
    PackageIcon
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

// US States for address form
const US_STATES = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

// Shipping Section Component
function ShippingSection({
    user,
    shippingAddress,
    setShippingAddress,
    shippingRates,
    setShippingRates,
    selectedRate,
    setSelectedRate,
    cartItems,
    onAddressValidated
}) {
    const t = useTranslations('checkout')
    const [savedAddresses, setSavedAddresses] = useState([])
    const [addressMode, setAddressMode] = useState('saved') // 'saved' or 'new'
    const [loadingAddresses, setLoadingAddresses] = useState(true)
    const [loadingRates, setLoadingRates] = useState(false)
    const [validatingAddress, setValidatingAddress] = useState(false)
    const [addressValidation, setAddressValidation] = useState(null)
    const [newAddress, setNewAddress] = useState({
        full_name: user?.user_metadata?.full_name || '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: ''
    })

    // Fetch saved addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await fetch('/api/addresses')
                const data = await response.json()
                if (data.success && data.addresses?.length > 0) {
                    setSavedAddresses(data.addresses)
                    // Auto-select default address
                    const defaultAddr = data.addresses.find(a => a.is_default) || data.addresses[0]
                    if (defaultAddr) {
                        setShippingAddress(defaultAddr)
                        setAddressMode('saved')
                    }
                } else {
                    setAddressMode('new')
                }
            } catch (error) {
                console.error('Error fetching addresses:', error)
                setAddressMode('new')
            } finally {
                setLoadingAddresses(false)
            }
        }
        fetchAddresses()
    }, [])

    // Fetch shipping rates when address changes
    useEffect(() => {
        const fetchRates = async () => {
            const address = addressMode === 'saved' ? shippingAddress : newAddress
            if (!address?.address_line_1 || !address?.city || !address?.state || !address?.postal_code) {
                return
            }

            setLoadingRates(true)
            setShippingRates([])
            setSelectedRate(null)

            try {
                const response = await fetch('/api/shipping/rates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        toAddress: address,
                        cartItems: cartItems
                    })
                })

                const data = await response.json()
                if (data.success && data.rates?.length > 0) {
                    setShippingRates(data.rates)
                    // Auto-select cheapest rate
                    setSelectedRate(data.rates[0])
                    onAddressValidated(true)
                } else {
                    toast.error(data.error || t('noShippingRates'))
                    onAddressValidated(false)
                }
            } catch (error) {
                console.error('Error fetching shipping rates:', error)
                toast.error(t('failedFetchRates'))
                onAddressValidated(false)
            } finally {
                setLoadingRates(false)
            }
        }

        // Debounce rate fetching
        const timeoutId = setTimeout(fetchRates, 500)
        return () => clearTimeout(timeoutId)
    }, [shippingAddress, newAddress, addressMode, cartItems])

    const validateAddress = async () => {
        const address = addressMode === 'saved' ? shippingAddress : newAddress
        if (!address?.address_line_1 || !address?.city || !address?.state || !address?.postal_code) {
            toast.error(t('fillAllFields'))
            return
        }

        setValidatingAddress(true)
        try {
            const response = await fetch('/api/shipping/validate-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            })

            const data = await response.json()
            setAddressValidation(data)

            if (data.is_valid) {
                toast.success(t('addressVerifiedSuccess'))
            } else {
                toast.warning(t('addressMayHaveIssues'))
            }
        } catch (error) {
            console.error('Error validating address:', error)
            toast.error(t('failedValidateAddress'))
        } finally {
            setValidatingAddress(false)
        }
    }

    const handleNewAddressChange = (field, value) => {
        setNewAddress(prev => ({ ...prev, [field]: value }))
        setAddressValidation(null)
        if (addressMode === 'new') {
            setShippingAddress({ ...newAddress, [field]: value })
        }
    }

    const handleSavedAddressSelect = (addressId) => {
        const selected = savedAddresses.find(a => a.id === addressId)
        if (selected) {
            setShippingAddress(selected)
            setAddressValidation(null)
        }
    }

    if (loadingAddresses) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Address Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{t('shippingAddress')}</h3>
                </div>

                {savedAddresses.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={addressMode === 'saved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAddressMode('saved')}
                        >
                            {t('savedAddresses')}
                        </Button>
                        <Button
                            variant={addressMode === 'new' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setAddressMode('new')
                                setShippingAddress(newAddress)
                            }}
                        >
                            {t('newAddress')}
                        </Button>
                    </div>
                )}

                {addressMode === 'saved' && savedAddresses.length > 0 ? (
                    <RadioGroup
                        value={shippingAddress?.id}
                        onValueChange={handleSavedAddressSelect}
                        className="space-y-2"
                    >
                        {savedAddresses.map((address) => (
                            <div
                                key={address.id}
                                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                    shippingAddress?.id === address.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleSavedAddressSelect(address.id)}
                            >
                                <RadioGroupItem value={address.id} id={address.id} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{address.full_name}</span>
                                        {address.is_default && (
                                            <Badge variant="secondary" className="text-xs">{t('default')}</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {address.address_line_1}
                                        {address.address_line_2 && `, ${address.address_line_2}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {address.city}, {address.state} {address.postal_code}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="ship_name">{t('fullName')}</Label>
                            <Input
                                id="ship_name"
                                value={newAddress.full_name}
                                onChange={(e) => handleNewAddressChange('full_name', e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label htmlFor="ship_address1">{t('addressLine1')}</Label>
                            <Input
                                id="ship_address1"
                                value={newAddress.address_line_1}
                                onChange={(e) => handleNewAddressChange('address_line_1', e.target.value)}
                                placeholder="123 Main St"
                            />
                        </div>
                        <div>
                            <Label htmlFor="ship_address2">{t('addressLine2Optional')}</Label>
                            <Input
                                id="ship_address2"
                                value={newAddress.address_line_2}
                                onChange={(e) => handleNewAddressChange('address_line_2', e.target.value)}
                                placeholder="Apt, Suite, Unit, etc."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ship_city">{t('city')}</Label>
                                <Input
                                    id="ship_city"
                                    value={newAddress.city}
                                    onChange={(e) => handleNewAddressChange('city', e.target.value)}
                                    placeholder="Los Angeles"
                                />
                            </div>
                            <div>
                                <Label htmlFor="ship_state">{t('state')}</Label>
                                <Select
                                    value={newAddress.state}
                                    onValueChange={(value) => handleNewAddressChange('state', value)}
                                >
                                    <SelectTrigger id="ship_state">
                                        <SelectValue placeholder={t('selectState')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {US_STATES.map((state) => (
                                            <SelectItem key={state.value} value={state.value}>
                                                {state.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ship_zip">{t('zipCode')}</Label>
                                <Input
                                    id="ship_zip"
                                    value={newAddress.postal_code}
                                    onChange={(e) => handleNewAddressChange('postal_code', e.target.value)}
                                    placeholder="90001"
                                />
                            </div>
                            <div>
                                <Label htmlFor="ship_phone">{t('phoneOptional')}</Label>
                                <Input
                                    id="ship_phone"
                                    value={newAddress.phone}
                                    onChange={(e) => handleNewAddressChange('phone', e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Validate Address Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={validateAddress}
                    disabled={validatingAddress}
                    className="mt-2"
                >
                    {validatingAddress ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('validating')}
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t('verifyAddress')}
                        </>
                    )}
                </Button>

                {/* Address Validation Result */}
                {addressValidation && (
                    <div className={`p-3 rounded-lg ${
                        addressValidation.is_valid
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {addressValidation.is_valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                            )}
                            <span className={`text-sm font-medium ${
                                addressValidation.is_valid ? 'text-green-800' : 'text-yellow-800'
                            }`}>
                                {addressValidation.is_valid ? t('addressVerified') : t('addressMayNeedReview')}
                            </span>
                        </div>
                        {addressValidation.messages?.length > 0 && (
                            <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
                                {addressValidation.messages.map((msg, i) => (
                                    <li key={i}>{msg.text || msg}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <Separator />

            {/* Shipping Rates */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{t('shippingMethod')}</h3>
                </div>

                {loadingRates ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-muted-foreground">{t('calculatingRates')}</span>
                    </div>
                ) : shippingRates.length > 0 ? (
                    <RadioGroup
                        value={selectedRate?.id}
                        onValueChange={(id) => {
                            const rate = shippingRates.find(r => r.id === id)
                            setSelectedRate(rate)
                        }}
                        className="space-y-2"
                    >
                        {shippingRates.map((rate) => (
                            <div
                                key={rate.id}
                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedRate?.id === rate.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedRate(rate)}
                            >
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value={rate.id} id={rate.id} />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{rate.provider}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {rate.service}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {rate.estimated_days
                                                ? t('businessDays', { count: rate.estimated_days })
                                                : rate.duration_terms || t('deliveryTimeVaries')}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-semibold">
                                    ${rate.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </RadioGroup>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <PackageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t('enterAddressForRates')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Express Checkout Component
function ExpressCheckout({ cartTotal, cartItems, onPaymentSuccess }) {
    const t = useTranslations('checkout')
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
                        toast.success(t('expressPaymentSuccess'))
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
                <h3 className="text-lg font-semibold">{t('expressCheckout')}</h3>
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
                        {t('orPayWithCard')}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Payment Form Component
function CheckoutForm({ cartTotal, cartItems, onPaymentSuccess, appliedOffers = [], offerDiscounts = {}, shippingAddress, selectedRate }) {
    const t = useTranslations('checkout')
    const stripe = useStripe()
    const elements = useElements()
    const { user, clearCart } = useAuth()
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState(null)
    const [sameAsShipping, setSameAsShipping] = useState(true)
    const [billingDetails, setBillingDetails] = useState({
        name: shippingAddress?.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        address: {
            line1: shippingAddress?.address_line_1 || '',
            city: shippingAddress?.city || '',
            state: shippingAddress?.state || '',
            postal_code: shippingAddress?.postal_code || '',
            country: shippingAddress?.country || 'US'
        }
    })

    // Update billing details when shipping address changes and sameAsShipping is true
    useEffect(() => {
        if (sameAsShipping && shippingAddress) {
            setBillingDetails({
                name: shippingAddress.full_name || user?.user_metadata?.full_name || '',
                email: user?.email || '',
                address: {
                    line1: shippingAddress.address_line_1 || '',
                    city: shippingAddress.city || '',
                    state: shippingAddress.state || '',
                    postal_code: shippingAddress.postal_code || '',
                    country: shippingAddress.country || 'US'
                }
            })
        }
    }, [shippingAddress, sameAsShipping])

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
                        shippingDetails: shippingAddress ? {
                            address: {
                                full_name: shippingAddress.full_name,
                                address_line_1: shippingAddress.address_line_1,
                                address_line_2: shippingAddress.address_line_2,
                                city: shippingAddress.city,
                                state: shippingAddress.state,
                                postal_code: shippingAddress.postal_code,
                                country: shippingAddress.country,
                                phone: shippingAddress.phone
                            },
                            method: selectedRate ? {
                                rate_id: selectedRate.id,
                                provider: selectedRate.provider,
                                service: selectedRate.service,
                                amount: selectedRate.amount,
                                estimated_days: selectedRate.estimated_days
                            } : null
                        } : null,
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
                    toast.success(t('paymentSuccess'))
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
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t('billingInformation')}</h3>
                        {shippingAddress && (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sameAsShipping}
                                    onChange={(e) => setSameAsShipping(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                {t('sameAsShipping')}
                            </label>
                        )}
                    </div>

                    {!sameAsShipping && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">{t('fullName')}</Label>
                                    <Input
                                        id="name"
                                        value={billingDetails.name}
                                        onChange={(e) => handleBillingChange('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">{t('email')}</Label>
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
                                <Label htmlFor="address">{t('address')}</Label>
                                <Input
                                    id="address"
                                    value={billingDetails.address.line1}
                                    onChange={(e) => handleBillingChange('address.line1', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">{t('city')}</Label>
                                    <Input
                                        id="city"
                                        value={billingDetails.address.city}
                                        onChange={(e) => handleBillingChange('address.city', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state">{t('state')}</Label>
                                    <Input
                                        id="state"
                                        value={billingDetails.address.state}
                                        onChange={(e) => handleBillingChange('address.state', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postal_code">{t('zipCode')}</Label>
                                    <Input
                                        id="postal_code"
                                        value={billingDetails.address.postal_code}
                                        onChange={(e) => handleBillingChange('address.postal_code', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {sameAsShipping && shippingAddress && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-medium">{shippingAddress.full_name}</p>
                            <p className="text-muted-foreground">
                                {shippingAddress.address_line_1}
                                {shippingAddress.address_line_2 && `, ${shippingAddress.address_line_2}`}
                            </p>
                            <p className="text-muted-foreground">
                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t('paymentInformation')}</h3>
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
                        <span className="text-green-800">{t('paymentSuccessMsg')}</span>
                    </div>
                )}

                {paymentStatus === 'error' && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800">{t('paymentFailedMsg')}</span>
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
                            {t('processingPayment')}
                        </>
                    ) : (
                        <>
                            <LockIcon className="w-4 h-4 mr-2" />
                            {t('payAmount', { amount: cartTotal.toFixed(2) })}
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}

// Main Checkout Component
export default function CheckoutPage() {
    const t = useTranslations('checkout')
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
    const [shippingAddress, setShippingAddress] = useState(null)
    const [shippingRates, setShippingRates] = useState([])
    const [selectedRate, setSelectedRate] = useState(null)
    const [addressValidated, setAddressValidated] = useState(false)
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
            toast.error(t('failedLoadCart'))
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
                    toast.error(t('offerInvalid', { title: offer.title, error: data.error }))
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
            toast.error(t('enterPromoCodeError'))
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
                    toast.info(t('offerAlreadyApplied'))
                } else {
                    const newOffers = [...appliedOffers, data.offer]
                    setAppliedOffers(newOffers)
                    
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('appliedOffers', JSON.stringify(newOffers))
                    }
                    
                    toast.success(t('promoApplied'))
                    setPromoCode('')
                }
            } else {
                toast.error(data.error || t('invalidPromoCode'))
            }
        } catch (error) {
            console.error('Error applying promo code:', error)
            toast.error(t('failedApplyPromo'))
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

    const calculateShipping = () => {
        return selectedRate?.amount || 0
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        const discount = calculateTotalDiscount()
        const shipping = calculateShipping()
        return Math.max(0, subtotal - discount + shipping)
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
                        <h2 className="text-xl font-semibold mb-2">{t('pleaseLogin')}</h2>
                        <p className="text-muted-foreground mb-4">{t('needLoginCheckout')}</p>
                        <TransitionLink href="/login">
                            <Button>{t('login')}</Button>
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
                        <h2 className="text-xl font-semibold mb-2">{t('cartEmpty')}</h2>
                        <p className="text-muted-foreground mb-4">{t('addProductsCheckout')}</p>
                        <TransitionLink href="/products">
                            <Button>
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                {t('continueShopping')}
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
                        <h2 className="text-2xl font-bold mb-2 text-green-800">{t('paymentSuccessful')}</h2>
                        <p className="text-muted-foreground mb-6">{t('thankYouOrder')}</p>
                        
                        <div className=" p-4 rounded-lg mb-6">
                            <h3 className="font-semibold mb-2">{t('orderSummary')}</h3>
                            <p className="text-sm text-muted-foreground">{t('orderId', { id: orderDetails?.transaction?.id })}</p>
                            <p className="text-sm text-muted-foreground">{t('totalAmount', { amount: formatPrice(orderDetails?.total || 0) })}</p>
                            <p className="text-sm text-muted-foreground">{t('itemsCount', { count: orderDetails?.items?.length || 0 })}</p>
                        </div>

                        <div className="flex gap-4">
                            <TransitionLink href="/products" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    {t('continueShopping')}
                                </Button>
                            </TransitionLink>
                            <TransitionLink href="/account" className="flex-1">
                                <Button className="w-full">
                                    {t('viewOrders')}
                                </Button>
                            </TransitionLink>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <TransitionLink href="/cart">
                        <Button variant="outline" size="icon">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        </Button>
                    </TransitionLink>
                    <h1 className="text-2xl font-bold">{t('checkout')}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orderSummary')}</CardTitle>
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
                                <Label className="text-sm font-medium">{t('promoCode')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t('enterPromoCode')}
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
                                        <p className="text-sm font-medium text-muted-foreground">{t('appliedOffers')}</p>
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
                                    <span>{t('subtotal')}</span>
                                    <span>{formatPrice(calculateSubtotal())}</span>
                                </div>
                                {calculateTotalDiscount() > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>{t('discount')}</span>
                                        <span>-{formatPrice(calculateTotalDiscount())}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span>{t('shippingLabel')}</span>
                                    <span>
                                        {selectedRate
                                            ? formatPrice(selectedRate.amount)
                                            : <span className="text-muted-foreground">{t('selectAddress')}</span>
                                        }
                                    </span>
                                </div>
                                {selectedRate && (
                                    <div className="text-xs text-muted-foreground">
                                        {selectedRate.provider} - {selectedRate.service}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center font-semibold text-lg">
                                <span>{t('total')}</span>
                                <span>{formatPrice(calculateTotal())}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Shipping & Payment */}
                <div className="space-y-6">
                    {/* Shipping Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TruckIcon className="w-5 h-5" />
                                {t('shipping')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ShippingSection
                                user={user}
                                shippingAddress={shippingAddress}
                                setShippingAddress={setShippingAddress}
                                shippingRates={shippingRates}
                                setShippingRates={setShippingRates}
                                selectedRate={selectedRate}
                                setSelectedRate={setSelectedRate}
                                cartItems={products}
                                onAddressValidated={setAddressValidated}
                            />
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5" />
                                {t('paymentDetails')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedRate ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <TruckIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">{t('pleaseSelectShipping')}</p>
                                    <p className="text-sm mt-1">{t('selectShippingDesc')}</p>
                                </div>
                            ) : (
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm
                                        cartTotal={calculateTotal()}
                                        cartItems={cartItems}
                                        onPaymentSuccess={handlePaymentSuccess}
                                        appliedOffers={appliedOffers}
                                        offerDiscounts={offerDiscounts}
                                        shippingAddress={shippingAddress}
                                        selectedRate={selectedRate}
                                    />
                                </Elements>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
