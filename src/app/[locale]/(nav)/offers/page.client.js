"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TicketPercentIcon, CheckIcon, CopyIcon, ShoppingCartIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { useTransitionRouter } from '@/components/ui/pageTransitions'

export default function OffersPageClient({ initialOffers }) {
  const { user } = useAuth()
  const router = useTransitionRouter()
  const [offers, setOffers] = useState(initialOffers || [])
  const [appliedOffers, setAppliedOffers] = useState([])
  const [applyingOffer, setApplyingOffer] = useState(null)

  useEffect(() => {
    // Load applied offers from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('appliedOffers')
        if (saved) {
          setAppliedOffers(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading applied offers:', error)
      }
    }
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('Promo code copied to clipboard!')
  }

  const applyOffer = (offer) => {
    if (!user) {
      toast.error('Please login to apply offers')
      router.push('/login')
      return
    }

    setApplyingOffer(offer.id)
    
    // Check if offer is already applied
    if (appliedOffers.find(applied => applied.id === offer.id)) {
      toast.info('This offer is already applied to your cart')
      setApplyingOffer(null)
      return
    }

    // Save to localStorage
    const newAppliedOffers = [...appliedOffers, offer]
    setAppliedOffers(newAppliedOffers)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('appliedOffers', JSON.stringify(newAppliedOffers))
    }

    toast.success('Offer applied! View your cart to see the discount.')
    setApplyingOffer(null)
  }

  const removeOffer = (offerId) => {
    const newAppliedOffers = appliedOffers.filter(offer => offer.id !== offerId)
    setAppliedOffers(newAppliedOffers)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('appliedOffers', JSON.stringify(newAppliedOffers))
    }
    
    toast.success('Offer removed')
  }

  const isOfferApplied = (offerId) => {
    return appliedOffers.some(applied => applied.id === offerId)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <TicketPercentIcon className="w-10 h-10" />
            Special Offers
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover our latest deals and promotions
          </p>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <TicketPercentIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No active offers at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for exciting deals!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const applied = isOfferApplied(offer.id)
              return (
                <Card 
                  key={offer.id} 
                  className={`hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    applied ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {offer.image_url && (
                    <div className="w-full h-48 relative">
                      <Image
                        src={offer.image_url}
                        alt={offer.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex-1">{offer.title}</CardTitle>
                      <div className="flex flex-col items-end gap-1">
                        {offer.discount_percentage !== null && (
                          <Badge variant="default" className="bg-green-600 text-white text-lg px-3 py-1">
                            {offer.discount_percentage}% OFF
                          </Badge>
                        )}
                        {offer.discount_amount !== null && (
                          <Badge variant="default" className="bg-green-600 text-white text-lg px-3 py-1">
                            {formatCurrency(offer.discount_amount)} OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {offer.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {offer.code && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-muted-foreground">Promo Code:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(offer.code)}
                              className="h-6 px-2"
                            >
                              <CopyIcon className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-mono font-bold text-lg">{offer.code}</p>
                        </div>
                      )}
                      
                      {(offer.start_date || offer.end_date) && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {offer.start_date && (
                            <p>Starts: {formatDate(offer.start_date)}</p>
                          )}
                          {offer.end_date && (
                            <p>Ends: {formatDate(offer.end_date)}</p>
                          )}
                        </div>
                      )}

                      {(offer.min_purchase_amount || offer.max_discount_amount) && (
                        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                          {offer.min_purchase_amount && (
                            <p>Min. purchase: {formatCurrency(offer.min_purchase_amount)}</p>
                          )}
                          {offer.max_discount_amount && (
                            <p>Max. discount: {formatCurrency(offer.max_discount_amount)}</p>
                          )}
                        </div>
                      )}

                      {offer.applicable_categories && offer.applicable_categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {offer.applicable_categories.map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Apply Offer Button */}
                      <div className="pt-3 border-t">
                        {applied ? (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full bg-green-50 border-green-500 text-green-700"
                              disabled
                            >
                              <CheckIcon className="w-4 h-4 mr-2" />
                              Applied to Cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => removeOffer(offer.id)}
                            >
                              Remove Offer
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() => applyOffer(offer)}
                            disabled={applyingOffer === offer.id}
                          >
                            {applyingOffer === offer.id ? (
                              <>Applying...</>
                            ) : (
                              <>
                                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                                Apply to Cart
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
