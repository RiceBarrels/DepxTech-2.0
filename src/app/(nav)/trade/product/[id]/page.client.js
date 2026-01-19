"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle,
  Loader2,
  DollarSignIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  MessageSquareIcon,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Package,
  HelpCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

// Helper to parse percentage from answer (handles "+10", "-10", "10", etc.)
const parsePercentage = (value) => {
  if (!value) return 0
  const str = String(value).trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

// Helper to parse fixed dollar amount
const parseFixed = (value) => {
  if (!value) return 0
  const num = parseFloat(String(value).trim())
  return isNaN(num) ? 0 : num
}

export default function TradeProductPageClient({ product, questions, accessories, basePrice: fallbackBasePrice, depreciation }) {
  const { user } = useAuth()

  // eBay price fetching state
  const [ebayPricing, setEbayPricing] = useState(null)
  const [ebayLoading, setEbayLoading] = useState(true)
  const [ebayError, setEbayError] = useState(null)

  // Determine actual base price (eBay or fallback)
  const basePrice = ebayPricing?.suggestedTradeIn ?? fallbackBasePrice

  // Track answers for each question: { questionIndex: answerIndex }
  const [answers, setAnswers] = useState({})
  // Track selected accessories: { accessoryId: boolean }
  const [selectedAccessories, setSelectedAccessories] = useState({})
  // Current step in the questionnaire
  const [currentStep, setCurrentStep] = useState(0)
  // Contact form data
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isDealBreaker, setIsDealBreaker] = useState(false)

  // Fetch eBay prices on mount
  useEffect(() => {
    async function fetchEbayPrice() {
      try {
        setEbayLoading(true)
        setEbayError(null)

        const response = await fetch(
          `/api/tradeins/ebay-price?query=${encodeURIComponent(product.title)}&productId=${product.id}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch eBay price')
        }

        if (data.suggestedTradeIn) {
          setEbayPricing(data)
        } else {
          // No eBay data found, will use fallback
          setEbayError('No market data available')
        }
      } catch (error) {
        console.error('Error fetching eBay price:', error)
        setEbayError(error.message)
      } finally {
        setEbayLoading(false)
      }
    }

    fetchEbayPrice()
  }, [product.id, product.title])

  const refreshEbayPrice = async () => {
    setEbayLoading(true)
    try {
      const response = await fetch(
        `/api/tradeins/ebay-price?query=${encodeURIComponent(product.title)}&productId=${product.id}&refresh=true`
      )
      const data = await response.json()
      if (data.suggestedTradeIn) {
        setEbayPricing(data)
        setEbayError(null)
        toast.success('Price updated from eBay')
      }
    } catch (error) {
      toast.error('Failed to refresh price')
    } finally {
      setEbayLoading(false)
    }
  }

  // Total steps: questions + accessories (if any) + contact form
  const hasAccessories = accessories && accessories.length > 0
  const totalSteps = questions.length + (hasAccessories ? 1 : 0) + 1 // +1 for contact form

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculate current quote value based on answers and accessories
  const calculatedQuote = useMemo(() => {
    let totalPercentageAdjustment = 0
    let totalFixedAdjustment = 0
    let hasDealBreaker = false

    // Calculate adjustments from question answers
    // New format: questions = [{title, ans: [{content, persentage, fixed}]}]
    questions.forEach((question, qIndex) => {
      const selectedAnswerIndex = answers[qIndex]
      if (selectedAnswerIndex !== undefined && question.ans && question.ans[selectedAnswerIndex]) {
        const answer = question.ans[selectedAnswerIndex]
        const percentage = parsePercentage(answer.persentage)
        const fixed = parseFixed(answer.fixed)

        totalPercentageAdjustment += percentage
        totalFixedAdjustment += fixed

        // Treat -100% as a deal breaker
        if (percentage <= -100) {
          hasDealBreaker = true
        }
      }
    })

    // Calculate bonus from accessories
    accessories.forEach(accessory => {
      if (selectedAccessories[accessory.id]) {
        totalPercentageAdjustment += Number(accessory.bonus_percent) || 0
      }
    })

    setIsDealBreaker(hasDealBreaker)

    if (hasDealBreaker) {
      return { value: 0, deduction: 100, bonus: 0, isDealBreaker: true }
    }

    // Apply percentage adjustments and fixed amounts
    // Positive percentage = bonus, negative percentage = deduction
    const afterPercentage = basePrice * (1 + totalPercentageAdjustment / 100)
    const finalValue = afterPercentage + totalFixedAdjustment

    return {
      value: Math.max(0, finalValue),
      percentageAdjustment: totalPercentageAdjustment,
      fixedAdjustment: totalFixedAdjustment,
      deduction: totalPercentageAdjustment < 0 ? Math.abs(totalPercentageAdjustment) : 0,
      bonus: totalPercentageAdjustment > 0 ? totalPercentageAdjustment : 0,
      isDealBreaker: false
    }
  }, [answers, selectedAccessories, questions, accessories, basePrice])

  // Check if current step is complete
  const isStepComplete = (stepIndex) => {
    if (stepIndex < questions.length) {
      // It's a question step - all questions are required by default
      return answers[stepIndex] !== undefined
    } else if (hasAccessories && stepIndex === questions.length) {
      // Accessories step - always complete (optional)
      return true
    } else {
      // Contact form step
      return formData.name && formData.email
    }
  }

  const canProceed = isStepComplete(currentStep)

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const handleAccessoryToggle = (accessoryId) => {
    setSelectedAccessories(prev => ({
      ...prev,
      [accessoryId]: !prev[accessoryId]
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all questions are answered
    const unansweredQuestions = questions.filter((q, idx) => answers[idx] === undefined)
    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all questions')
      return
    }

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      // Build answers summary for submission using new format
      const answersSummary = questions.map((q, qIndex) => {
        const selectedAnswerIndex = answers[qIndex]
        const selectedAnswer = q.ans && q.ans[selectedAnswerIndex]
        return {
          questionIndex: qIndex,
          questionText: q.title,
          answerIndex: selectedAnswerIndex,
          answerText: selectedAnswer?.content || 'Not answered',
          percentageAdjustment: parsePercentage(selectedAnswer?.persentage),
          fixedAdjustment: parseFixed(selectedAnswer?.fixed)
        }
      })

      const accessoriesSummary = accessories
        .filter(a => selectedAccessories[a.id])
        .map(a => ({
          accessoryId: a.id,
          name: a.name,
          bonusPercent: a.bonus_percent
        }))

      const response = await fetch('/api/tradeins/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          answers: answersSummary,
          accessories: accessoriesSummary,
          estimatedValue: calculatedQuote.value,
          totalDeduction: calculatedQuote.deduction,
          totalBonus: calculatedQuote.bonus,
          basePrice: basePrice,
          depreciation: depreciation,
          // eBay pricing data
          ebayPricing: ebayPricing ? {
            suggestedTradeIn: ebayPricing.suggestedTradeIn,
            tradeInRange: ebayPricing.tradeInRange,
            usedMarketMedian: ebayPricing.usedMarket?.median,
            newMarketMedian: ebayPricing.newMarket?.median,
            fetchedAt: ebayPricing.fetchedAt
          } : null,
          priceSource: ebayPricing ? 'ebay' : 'database',
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
    } catch (error) {
      console.error('Error submitting quote:', error)
      toast.error(error.message || 'Failed to submit quote request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Render success state
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
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Your Estimated Value</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatCurrency(calculatedQuote.value)}
              </p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">
                Final value will be confirmed after inspection
              </p>
            </div>
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
              onClick={() => {
                setSubmitted(false)
                setCurrentStep(0)
                setAnswers({})
                setSelectedAccessories({})
                setFormData({
                  name: user?.user_metadata?.full_name || '',
                  email: user?.email || '',
                  phone: '',
                  notes: ''
                })
              }}
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

  // Render current step content
  const renderStepContent = () => {
    // Question steps
    if (currentStep < questions.length) {
      const question = questions[currentStep]
      const questionAnswers = question.ans || []

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <h3 className="text-lg font-semibold">{question.title}</h3>
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </div>
          </div>

          <div className="space-y-2">
            {questionAnswers.map((answer, ansIdx) => {
              const isSelected = answers[currentStep] === ansIdx
              const percentage = parsePercentage(answer.persentage)
              const fixed = parseFixed(answer.fixed)
              const isDealBreakerAnswer = percentage <= -100

              return (
                <button
                  key={ansIdx}
                  type="button"
                  onClick={() => handleAnswerSelect(currentStep, ansIdx)}
                  className={cn(
                    "w-full text-left p-4 border-2 rounded-xl transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                    isDealBreakerAnswer && isSelected && "border-red-500 bg-red-50 dark:bg-red-950/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{answer.content}</span>
                        {isDealBreakerAnswer && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Accepted
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {percentage !== 0 && !isDealBreakerAnswer && (
                        <Badge variant={percentage > 0 ? "default" : "secondary"} className="text-xs">
                          {percentage > 0 ? '+' : ''}{percentage}%
                        </Badge>
                      )}
                      {fixed !== 0 && !isDealBreakerAnswer && (
                        <Badge variant={fixed > 0 ? "default" : "secondary"} className="text-xs">
                          {fixed > 0 ? '+' : ''}{formatCurrency(fixed)}
                        </Badge>
                      )}
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    // Accessories step
    if (hasAccessories && currentStep === questions.length) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Included Accessories</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select any accessories you're including to increase your trade-in value
            </p>
          </div>

          <div className="space-y-2">
            {accessories.map((accessory) => {
              const isSelected = selectedAccessories[accessory.id]
              const bonus = Number(accessory.bonus_percent) || 0

              return (
                <button
                  key={accessory.id}
                  type="button"
                  onClick={() => handleAccessoryToggle(accessory.id)}
                  className={cn(
                    "w-full text-left p-4 border-2 rounded-xl transition-all",
                    isSelected
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md"
                      : "border-border hover:border-green-500/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      <div>
                        <span className="font-medium">{accessory.name}</span>
                        {accessory.description && (
                          <p className="text-sm text-muted-foreground">{accessory.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      +{bonus}%
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    // Contact form step
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide your details so we can send you the quote and shipping label
          </p>
        </div>

        <div className="space-y-4">
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
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional details about your device..."
            />
          </div>
        </div>
      </div>
    )
  }

  const isLastStep = currentStep === totalSteps - 1

  return (
    <Card className="shadow-xl border-2">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Get Your Quote</CardTitle>
            <CardDescription className="text-base">
              Answer a few questions about your {product.title}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Step</p>
            <p className="text-2xl font-bold">{currentStep + 1} / {totalSteps}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current quote display */}
          <div className={cn(
            "p-4 rounded-xl border-2 transition-all",
            isDealBreaker
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-sm font-medium flex items-center gap-2",
                  isDealBreaker ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"
                )}>
                  {isDealBreaker ? "Not Eligible for Trade-in" : "Current Estimate"}
                  {ebayLoading && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {ebayPricing && !ebayLoading && (
                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      eBay Market
                    </Badge>
                  )}
                </p>
                <p className={cn(
                  "text-3xl font-bold",
                  isDealBreaker ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                )}>
                  {ebayLoading ? (
                    <span className="text-2xl text-muted-foreground">Checking market...</span>
                  ) : isDealBreaker ? (
                    "N/A"
                  ) : (
                    formatCurrency(calculatedQuote.value)
                  )}
                </p>
              </div>
              {!isDealBreaker && !ebayLoading && (
                <div className="text-right text-xs space-y-1">
                  {calculatedQuote.deduction > 0 && (
                    <p className="text-muted-foreground">
                      Deductions: -{calculatedQuote.deduction}%
                    </p>
                  )}
                  {calculatedQuote.bonus > 0 && (
                    <p className="text-green-600 dark:text-green-400">
                      Bonuses: +{calculatedQuote.bonus}%
                    </p>
                  )}
                  {calculatedQuote.fixedAdjustment !== 0 && (
                    <p className={calculatedQuote.fixedAdjustment > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                    }>
                      Fixed: {calculatedQuote.fixedAdjustment > 0 ? '+' : ''}{formatCurrency(calculatedQuote.fixedAdjustment)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={refreshEbayPrice}
                    disabled={ebayLoading}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto"
                  >
                    <RefreshCw className={cn("w-3 h-3", ebayLoading && "animate-spin")} />
                    Refresh
                  </button>
                </div>
              )}
            </div>
            {isDealBreaker && (
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-2">
                Based on your answers, this device is not eligible for our trade-in program
              </p>
            )}
            {/* eBay market info */}
            {ebayPricing && !ebayLoading && !isDealBreaker && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Based on {ebayPricing.usedMarket?.count || ebayPricing.newMarket?.count || 0} eBay listings
                  </span>
                  <span className="text-muted-foreground">
                    Range: {formatCurrency(ebayPricing.tradeInRange?.low || 0)} - {formatCurrency(ebayPricing.tradeInRange?.high || 0)}
                  </span>
                </div>
              </div>
            )}
            {ebayError && !ebayLoading && (
              <div className="mt-2 text-xs text-muted-foreground">
                Using estimated price (eBay data unavailable)
              </div>
            )}
          </div>

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {isLastStep ? (
              <Button
                type="submit"
                disabled={submitting || !canProceed || isDealBreaker}
                className="gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Get My Quote
                    <DollarSignIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Trust badges on last step */}
          {isLastStep && (
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
          )}
        </form>
      </CardContent>
    </Card>
  )
}
