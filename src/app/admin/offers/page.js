"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, EditIcon, TrashIcon, PlusIcon, SearchIcon, TicketPercentIcon } from 'lucide-react'

export default function OffersManagePage() {
    const router = useTransitionRouter()
    const [offers, setOffers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredOffers, setFilteredOffers] = useState([])
    const [deleting, setDeleting] = useState(null)

    // Fetch offers
    useEffect(() => {
        async function fetchOffers() {
            try {
                setLoading(true)
                const response = await fetch('/api/admin/offers')
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch offers')
                }
                
                setOffers(data.offers || [])
                setFilteredOffers(data.offers || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        
        fetchOffers()
    }, [])

    // Filter offers based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredOffers(offers)
        } else {
            const filtered = offers.filter(offer =>
                offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.code?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredOffers(filtered)
        }
    }, [searchTerm, offers])

    const handleDelete = async (offerId) => {
        if (!confirm('Are you sure you want to delete this offer?')) {
            return
        }

        setDeleting(offerId)
        try {
            const response = await fetch(`/api/admin/offers?id=${offerId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete offer')
            }

            // Remove the deleted offer from state
            setOffers(prev => prev.filter(o => o.id !== offerId))
            setFilteredOffers(prev => prev.filter(o => o.id !== offerId))
        } catch (err) {
            alert('Error deleting offer: ' + err.message)
        } finally {
            setDeleting(null)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    const isOfferActive = (offer) => {
        if (!offer.is_active) return false
        const now = new Date()
        const startDate = offer.start_date ? new Date(offer.start_date) : null
        const endDate = offer.end_date ? new Date(offer.end_date) : null
        
        if (startDate && now < startDate) return false
        if (endDate && now > endDate) return false
        return true
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Manage Offers</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            Loading offers...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Manage Offers</h1>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="text-red-800 text-center">
                            Error: {error}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Manage Offers</h1>
                </div>
                <Button onClick={() => router.push('/admin/offers/add')} className="bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Offer
                </Button>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Search Offers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by title, description, or code..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Offers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{offers.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Offers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {offers.filter(o => isOfferActive(o)).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Offers List */}
            <div className="grid gap-4">
                {filteredOffers.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-muted-foreground">
                                {searchTerm ? 'No offers found matching your search.' : 'No offers found. Add your first offer to get started.'}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOffers.map((offer) => (
                        <Card key={offer.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <TicketPercentIcon className="w-5 h-5" />
                                            {offer.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {offer.description || 'No description provided'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/admin/offers/edit/${offer.id}`)}
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(offer.id)}
                                            disabled={deleting === offer.id}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {deleting === offer.id ? (
                                                <div className="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full" />
                                            ) : (
                                                <TrashIcon className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Status and Discount */}
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <Badge variant={isOfferActive(offer) ? "default" : "secondary"}>
                                            {isOfferActive(offer) ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {offer.discount_percentage !== null && (
                                            <Badge variant="outline" className="text-green-600">
                                                {offer.discount_percentage}% OFF
                                            </Badge>
                                        )}
                                        {offer.discount_amount !== null && (
                                            <Badge variant="outline" className="text-green-600">
                                                {formatCurrency(offer.discount_amount)} OFF
                                            </Badge>
                                        )}
                                        {offer.code && (
                                            <Badge variant="outline">
                                                Code: {offer.code}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Start Date:</p>
                                            <p className="font-medium">{formatDate(offer.start_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">End Date:</p>
                                            <p className="font-medium">{formatDate(offer.end_date)}</p>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    {(offer.min_purchase_amount || offer.max_discount_amount || offer.applicable_categories?.length > 0) && (
                                        <div className="space-y-2 text-sm">
                                            {offer.min_purchase_amount && (
                                                <p className="text-muted-foreground">
                                                    Min Purchase: {formatCurrency(offer.min_purchase_amount)}
                                                </p>
                                            )}
                                            {offer.max_discount_amount && (
                                                <p className="text-muted-foreground">
                                                    Max Discount: {formatCurrency(offer.max_discount_amount)}
                                                </p>
                                            )}
                                            {offer.applicable_categories?.length > 0 && (
                                                <div>
                                                    <p className="text-muted-foreground mb-1">Applicable Categories:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {offer.applicable_categories.map((cat, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {cat}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Created Date */}
                                    <div className="text-sm text-muted-foreground">
                                        Created: {formatDate(offer.created_at)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
