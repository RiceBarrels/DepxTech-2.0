"use client"

import { useState, useMemo } from "react"
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
  MessageSquareIcon,
  AlertCircle,
  ChevronRight,
  ChevronLeft
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

// Helper to get image URL (handles both string URLs and {url: "..."} objects)
const getImageUrl = (img) => {
  if (!img) return null
  if (typeof img === 'string') return img
  if (typeof img === 'object' && img.url) return img.url
  return null
}

export default function TradeProductPageClient({ product, questions, basePrice, minPrice, depreciation }) {
  const { user } = useAuth()

  // Track answers for each question: { questionIndex: answerIndex }
  const [answers, setAnswers] = useState({})
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

  // Total steps: questions + contact form
  const totalSteps = (questions?.length || 0) + 1 // +1 for contact form

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculate current quote value based on answers
  const calculatedQuote = useMemo(function calculateQuote() {
    const questionsList = questions || []
    let totalPercentageAdjustment = 0
    let totalFixedAdjustment = 0

    for (let qIndex = 0; qIndex < questionsList.length; qIndex++) {
      const question = questionsList[qIndex]
      const selectedAnswer = answers[qIndex]
      const isMultiple = question.type === 'multiple'

      if (isMultiple && Array.isArray(selectedAnswer)) {
        for (let i = 0; i < selectedAnswer.length; i++) {
          const answerIndex = selectedAnswer[i]
          if (question.ans && question.ans[answerIndex]) {
            const answer = question.ans[answerIndex]
            const percentage = parsePercentage(answer.persentage)
            const fixed = parseFixed(answer.fixed)
            totalPercentageAdjustment += percentage
            totalFixedAdjustment += fixed
          }
        }
      } else if (selectedAnswer !== undefined && question.ans && question.ans[selectedAnswer]) {
        const answer = question.ans[selectedAnswer]
        const percentage = parsePercentage(answer.persentage)
        const fixed = parseFixed(answer.fixed)
        totalPercentageAdjustment += percentage
        totalFixedAdjustment += fixed
      }
    }

    const afterPercentage = basePrice * (1 + totalPercentageAdjustment / 100)
    let finalValue = afterPercentage + totalFixedAdjustment
    const appliedMinPrice = minPrice && finalValue < minPrice

    if (minPrice && finalValue < minPrice) {
      finalValue = minPrice
    }

    // Ensure value doesn't go below 0
    finalValue = Math.max(0, finalValue)

    return {
      value: finalValue,
      percentageAdjustment: totalPercentageAdjustment,
      fixedAdjustment: totalFixedAdjustment,
      deduction: totalPercentageAdjustment < 0 ? Math.abs(totalPercentageAdjustment) : 0,
      bonus: totalPercentageAdjustment > 0 ? totalPercentageAdjustment : 0,
      isZeroValue: finalValue === 0,
      appliedMinPrice: appliedMinPrice
    }
  }, [answers, questions, basePrice, minPrice])

  // Check if current step is complete
  const isStepComplete = (stepIndex) => {
    const questionsList = questions || []
    if (stepIndex < questionsList.length) {
      const question = questionsList[stepIndex]
      const answer = answers[stepIndex]

      // Optional questions are always complete (can skip)
      if (question.required === false) {
        return true
      }

      // Required questions need an answer
      if (question.type === 'multiple') {
        // Multi-select: must have at least one answer selected
        return Array.isArray(answer) && answer.length > 0
      } else {
        // Single-select: must have an answer
        return answer !== undefined
      }
    } else {
      // Contact form step
      return formData.name && formData.email
    }
  }

  const canProceed = isStepComplete(currentStep)

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const question = questions?.[questionIndex]
    const isMultiple = question?.type === 'multiple'

    setAnswers(prev => {
      if (isMultiple) {
        // Multi-select: toggle the answer in the array
        const currentAnswers = Array.isArray(prev[questionIndex]) ? prev[questionIndex] : []
        const isSelected = currentAnswers.includes(answerIndex)

        if (isSelected) {
          // Remove from selection
          return {
            ...prev,
            [questionIndex]: currentAnswers.filter(idx => idx !== answerIndex)
          }
        } else {
          // Add to selection
          return {
            ...prev,
            [questionIndex]: [...currentAnswers, answerIndex]
          }
        }
      } else {
        // Single-select: replace the answer
        return {
          ...prev,
          [questionIndex]: answerIndex
        }
      }
    })
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

    // Validate all required questions are answered
    const unansweredQuestions = (questions || []).filter((q, idx) => {
      // Skip optional questions
      if (q.required === false) {
        return false
      }
      const answer = answers[idx]
      if (q.type === 'multiple') {
        return !Array.isArray(answer) || answer.length === 0
      }
      return answer === undefined
    })
    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all required questions')
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
      // Build answers summary for submission
      const answersSummary = (questions || []).map((q, qIndex) => {
        const selectedAnswer = answers[qIndex]
        const isMultiple = q.type === 'multiple'

        if (isMultiple && Array.isArray(selectedAnswer)) {
          // Multi-select: include all selected answers
          const selectedAnswers = selectedAnswer.map(ansIdx => q.ans && q.ans[ansIdx]).filter(Boolean)
          return {
            questionIndex: qIndex,
            questionText: q.title,
            questionType: 'multiple',
            answerIndices: selectedAnswer,
            answerTexts: selectedAnswers.map(a => a?.content || 'Not answered'),
            percentageAdjustment: selectedAnswers.reduce((sum, a) => sum + parsePercentage(a?.persentage), 0),
            fixedAdjustment: selectedAnswers.reduce((sum, a) => sum + parseFixed(a?.fixed), 0)
          }
        } else {
          // Single-select: single answer
          const answer = q.ans && q.ans[selectedAnswer]
          return {
            questionIndex: qIndex,
            questionText: q.title,
            questionType: 'single',
            answerIndex: selectedAnswer,
            answerText: answer?.content || 'Not answered',
            percentageAdjustment: parsePercentage(answer?.persentage),
            fixedAdjustment: parseFixed(answer?.fixed)
          }
        }
      })

      const response = await fetch('/api/tradeins/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          answers: answersSummary,
          estimatedValue: calculatedQuote.value,
          totalDeduction: calculatedQuote.deduction,
          totalBonus: calculatedQuote.bonus,
          basePrice: basePrice,
          depreciation: depreciation,
          priceSource: 'database',
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
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quote Request Submitted!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              We'll review your request and contact you within 24 hours.
            </p>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-6">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Your Estimated Value</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(calculatedQuote.value)}
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                Final value confirmed after inspection
              </p>
            </div>

            <div className="text-left bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">What's next?</p>
              <div className="space-y-2.5">
                {[
                  'Check your email for confirmation',
                  'We\'ll send you a prepaid shipping label',
                  'Ship your device (we cover the cost)',
                  'Get paid after verification'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                setSubmitted(false)
                setCurrentStep(0)
                setAnswers({})
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
    const questionsList = questions || []
    if (currentStep < questionsList.length) {
      const question = questionsList[currentStep]
      const questionAnswers = question.ans || []
      const isMultiple = question.type === 'multiple'
      const currentAnswers = answers[currentStep]

      // Helper to check if an answer is selected
      const isAnswerSelected = (ansIdx) => {
        if (isMultiple) {
          return Array.isArray(currentAnswers) && currentAnswers.includes(ansIdx)
        }
        return currentAnswers === ansIdx
      }

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{question.title}</h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {question.required !== false ? (
                  <span className="text-xs text-red-500">Required</span>
                ) : (
                  <span className="text-xs text-slate-400">Optional</span>
                )}
                {isMultiple && (
                  <span className="text-xs text-slate-400 ml-1">• Multi-select</span>
                )}
              </div>
            </div>
            {/* Question image */}
            {getImageUrl(question.img) && (
              <div className="mt-2">
                <img
                  src={getImageUrl(question.img)}
                  alt={question.title}
                  className="max-w-full h-auto max-h-40 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {questionAnswers.map((answer, ansIdx) => {
              const isSelected = isAnswerSelected(ansIdx)
              const percentage = parsePercentage(answer.persentage)
              const fixed = parseFixed(answer.fixed)
              const isZeroValueAnswer = percentage <= -100

              return (
                <div
                  key={ansIdx}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleAnswerSelect(currentStep, ansIdx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleAnswerSelect(currentStep, ansIdx)
                    }
                  }}
                  className={cn(
                    "w-full text-left p-3.5 border rounded-xl transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30",
                    isZeroValueAnswer && isSelected && "border-orange-400 bg-orange-50 dark:bg-orange-950/30 ring-orange-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Selection indicator */}
                    <div className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>

                    {/* Answer image */}
                    {getImageUrl(answer.img) && (
                      <img
                        src={getImageUrl(answer.img)}
                        alt={answer.content}
                        className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-600 object-cover flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <span className={cn(
                            "font-medium text-sm",
                            isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                          )}>{answer.content}</span>
                          {isZeroValueAnswer && (
                            <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">No value</span>
                          )}
                          {answer.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{answer.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {percentage !== 0 && !isZeroValueAnswer && (
                            <span className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded",
                              percentage > 0
                                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            )}>
                              {percentage > 0 ? '+' : ''}{percentage}%
                            </span>
                          )}
                          {fixed !== 0 && !isZeroValueAnswer && (
                            <span className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded",
                              fixed > 0
                                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            )}>
                              {fixed > 0 ? '+' : ''}{formatCurrency(fixed)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Contact form step
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Contact Information</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We'll send your quote and shipping label to this email
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone Number <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Additional Notes <span className="text-slate-400 text-xs">(optional)</span>
            </Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-slate-800 text-sm"
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
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Get Your Quote</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Answer a few questions about your device
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="text-primary font-bold">{currentStep + 1}</span>
            <span className="text-slate-400">/</span>
            <span>{totalSteps}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current quote display */}
          <div className={cn(
            "p-4 rounded-xl border transition-all",
            calculatedQuote.isZeroValue
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
              : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-xs font-medium",
                  calculatedQuote.isZeroValue ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {calculatedQuote.isZeroValue ? "Free Recycling Available" : "Your Estimate"}
                </p>
                <p className={cn(
                  "text-2xl font-bold mt-0.5",
                  calculatedQuote.isZeroValue ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {formatCurrency(calculatedQuote.value)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {calculatedQuote.deduction > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    -{calculatedQuote.deduction}%
                  </span>
                )}
                {calculatedQuote.bonus > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    +{calculatedQuote.bonus}%
                  </span>
                )}
                {calculatedQuote.appliedMinPrice && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                    Min. price
                  </span>
                )}
              </div>
            </div>
            {calculatedQuote.isZeroValue && (
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-2">
                We can still accept your device for free recycling.
              </p>
            )}
          </div>

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {isLastStep ? (
              <Button
                type="submit"
                disabled={submitting || !canProceed}
                className="gap-2 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Get My Quote
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-1.5 px-5"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Trust badges on last step */}
          {isLastStep && (
            <div className="flex items-center justify-center gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Free shipping
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Data wiping
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                24h response
              </span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
