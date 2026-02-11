"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
    PackageIcon, 
    CreditCardIcon,
    CalendarIcon,
    DollarSignIcon,
    ShoppingBagIcon,
    ReceiptIcon,
    ArrowLeftIcon,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { TransitionLink } from "@/components/ui/pageTransitions"
import { useTranslations } from 'next-intl'

export default function OrdersPage() {
    const { user, getUserTransactions } = useAuth()
    const t = useTranslations('account.ordersPage')
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchTransactions()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const result = await getUserTransactions()
            if (result.success) {
                // Sort transactions by created date (newest first)
                const sortedTransactions = result.transactions.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                )
                setTransactions(sortedTransactions)
            } else {
                console.error('Error fetching transactions:', result.error)
                toast.error(t('errorLoadOrders'))
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
            toast.error(t('errorLoadOrders'))
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price / 100) // Convert from cents to dollars
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'succeeded':
                return 'default'
            case 'pending':
                return 'secondary'
            case 'failed':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'succeeded':
                return <PackageIcon className="h-4 w-4" />
            case 'pending':
                return <Loader2 className="h-4 w-4 animate-spin" />
            case 'failed':
                return <CreditCardIcon className="h-4 w-4" />
            default:
                return <ReceiptIcon className="h-4 w-4" />
        }
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <h2 className="text-xl font-semibold mb-2">{t('pleaseLogIn')}</h2>
                        <p className="text-muted-foreground mb-4">{t('needLogIn')}</p>
                        <TransitionLink href="/login">
                            <Button>{t('goToLogin')}</Button>
                        </TransitionLink>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subheading')}</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">{t('loading')}</span>
                </div>
            ) : transactions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ShoppingBagIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t('noOrders')}</h2>
                        <p className="text-muted-foreground mb-4">{t('noOrdersDesc')}</p>
                        <TransitionLink href="/products">
                            <Button>{t('startShopping')}</Button>
                        </TransitionLink>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {transactions.map((transaction) => {
                        let cartItems = []
                        let billingDetails = {}
                        
                        try {
                            cartItems = JSON.parse(transaction.cart_items || '[]')
                            billingDetails = JSON.parse(transaction.billing_details || '{}')
                        } catch (error) {
                            console.error('Error parsing transaction data:', error)
                        }

                        return (
                            <Card key={transaction.id} className="overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {getStatusIcon(transaction.status)}
                                                Order #{transaction.payment_intent_id?.slice(-8) || transaction.id.slice(-8)}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(transaction.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                                {transaction.status}
                                            </Badge>
                                            <p className="text-lg font-semibold mt-1">
                                                {formatPrice(transaction.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Order Items */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <PackageIcon className="h-4 w-4" />
                                                {t('itemsOrdered')}
                                            </h4>
                                            {cartItems.length > 0 ? (
                                                <div className="space-y-2">
                                                    {cartItems.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                                            <div>
                                                                <p className="font-medium">{item.name || `Product ${item.productId}`}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Quantity: {item.amount || item.quantity || 1}
                                                                </p>
                                                            </div>
                                                            {item.price && (
                                                                <p className="font-semibold">
                                                                    {formatPrice(item.price * (item.amount || item.quantity || 1))}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">No item details available</p>
                                            )}
                                        </div>

                                        {/* Billing Information */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <CreditCardIcon className="h-4 w-4" />
                                                {t('billingInfo')}
                                            </h4>
                                            {billingDetails.name || billingDetails.email ? (
                                                <div className="space-y-2 text-sm">
                                                    {billingDetails.name && (
                                                        <p><span className="font-medium">{t('name')}</span> {billingDetails.name}</p>
                                                    )}
                                                    {billingDetails.email && (
                                                        <p><span className="font-medium">{t('email')}</span> {billingDetails.email}</p>
                                                    )}
                                                    {billingDetails.address?.line1 && (
                                                        <div>
                                                            <p className="font-medium">{t('address')}</p>
                                                            <p>{billingDetails.address.line1}</p>
                                                            {billingDetails.address.line2 && <p>{billingDetails.address.line2}</p>}
                                                            <p>
                                                                {billingDetails.address.city}, {billingDetails.address.state} {billingDetails.address.postal_code}
                                                            </p>
                                                            {billingDetails.address.country && <p>{billingDetails.address.country}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">No billing details available</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="my-4" />
                                    
                                    {/* Transaction Details */}
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <ReceiptIcon className="h-3 w-3" />
                                                {t('paymentId')} {transaction.payment_intent_id || 'N/A'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSignIcon className="h-3 w-3" />
                                                {t('currency')} {transaction.currency?.toUpperCase() || 'USD'}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" />
                                            {formatDate(transaction.updated_at || transaction.created_at)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
