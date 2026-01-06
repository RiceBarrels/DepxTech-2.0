"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Loader2, 
  DollarSignIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  MessageSquareIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'

export default function TradeProductPageClient({ product, conditions }) {
  const { user } = useAuth()
  const [selectedCondition, setSelectedCondition] = useState('')
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const selectedConditionData = conditions.find(c => c.key === selectedCondition)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCondition) {
      toast.error('Please select a condition')
      return
    }

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/tradeins/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          condition: selectedCondition,
          estimatedValue: selectedConditionData.price,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          notes: formData.notes || null,
          userId: user?.id || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request')
      }

      setSubmitted(true)
      toast.success('Quote request submitted successfully! We\'ll contact you soon.')
      
      // Reset form
      setFormData({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: '',
        notes: ''
      })
      setSelectedCondition('')
    } catch (error) {
      console.error('Error submitting quote:', error)
      toast.error(error.message || 'Failed to submit quote request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="shadow-xl border-2 border-green-200 dark:border-green-800">
        <CardContent className="pt-8 pb-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Quote Request Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest. We'll review your request and contact you within 24 hours.
            </p>
            {selectedConditionData && (
              <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Your Estimated Value</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatCurrency(selectedConditionData.price)}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">
                  Final value will be confirmed after inspection
                </p>
              </div>
            )}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold mb-3">What's next?</p>
              <div className="text-left space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Check your email for confirmation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>We'll send you a prepaid shipping label</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Ship your device (we cover the cost)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span>Get paid after verification</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="mt-6 w-full"
            >
              Submit Another Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="text-2xl">Get Your Quote</CardTitle>
        <CardDescription className="text-base">
          Get an instant estimate for your {product.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Condition Selection - Compact */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Condition *</Label>
            <div className="space-y-2">
              {conditions.map((condition) => (
                <button
                  key={condition.key}
                  type="button"
                  onClick={() => setSelectedCondition(condition.key)}
                  className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                    selectedCondition === condition.key
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={condition.badge}
                        className={`${condition.badgeColor} text-white`}
                      >
                        {condition.label}
                      </Badge>
                      <span className="font-bold text-lg">
                        {formatCurrency(condition.price)}
                      </span>
                    </div>
                    {selectedCondition === condition.key && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedCondition && (
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Your Estimated Value</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(selectedConditionData.price)}
              </p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                Final value confirmed after inspection
              </p>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="name">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <MailIcon className="w-4 h-4 inline mr-2" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <PhoneIcon className="w-4 h-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                <MessageSquareIcon className="w-4 h-4 inline mr-2" />
                Additional Notes
              </Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Tell us about any specific issues, accessories included, etc."
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow" 
            size="lg"
            disabled={submitting || !selectedCondition}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Get My Quote
                <DollarSignIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Free shipping label included</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure data wiping guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>24-hour response time</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2 border-t">
            By submitting, you agree to our terms and conditions. We'll contact you within 24 hours.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
