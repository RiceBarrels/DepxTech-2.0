"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MessageSquareIcon,
  Package,
  BoxIcon,
  Clock,
  ArrowLeft,
  AlertTriangle,
  MapPinIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { useWebHaptics } from "web-haptics/react"
import Image from 'next/image'

// ── Helpers ──────────────────────────
const parsePercentage = (value) => {
  if (!value) return 0
  const num = parseFloat(String(value).trim())
  return isNaN(num) ? 0 : num
}

const parseFixed = (value) => {
  if (!value) return 0
  const num = parseFloat(String(value).trim())
  return isNaN(num) ? 0 : num
}

const getImageUrl = (img) => {
  if (!img) return null
  if (typeof img === 'string') return img
  if (typeof img === 'object' && img.url) return img.url
  return null
}

// ── Step transition variants ─────────────────────
const stepVariants = {
  enter: (direction) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
}

export default function TradeProductStartClient({ product, questions, basePrice, minPrice, depreciation }) {
  const { user } = useAuth()
  const t = useTranslations('trade.product')
  const { trigger } = useWebHaptics()

  // ── Phase: 'questions' | 'result' | 'submitted' ──
  const [phase, setPhase] = useState('questions')

  // ── Questions phase state ──
  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const autoAdvanceTimer = useRef(null)
  const triggerRef = useRef(trigger)
  triggerRef.current = trigger

  // ── Result phase state ──
  const [answersSummary, setAnswersSummary] = useState([])
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [shippingMethod, setShippingMethod] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [animatedPrice, setAnimatedPrice] = useState(0)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addressMode, setAddressMode] = useState('saved') // 'saved' | 'new'
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  const totalSteps = questions?.length || 1

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  // Fetch saved addresses when entering result phase
  useEffect(() => {
    if (phase !== 'result' || !user) return
    setLoadingAddresses(true)
    fetch('/api/addresses')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.addresses?.length > 0) {
          setSavedAddresses(data.addresses)
          const defaultAddr = data.addresses.find(a => a.is_default) || data.addresses[0]
          setSelectedAddressId(defaultAddr.id)
          setFormData(prev => ({
            ...prev,
            name: defaultAddr.full_name || prev.name,
            phone: defaultAddr.phone || prev.phone,
            address: defaultAddr.address_line_1 + (defaultAddr.address_line_2 ? ', ' + defaultAddr.address_line_2 : ''),
            city: defaultAddr.city,
            state: defaultAddr.state,
            zipCode: defaultAddr.postal_code,
          }))
          setAddressMode('saved')
        } else {
          setAddressMode('new')
        }
      })
      .catch(() => setAddressMode('new'))
      .finally(() => setLoadingAddresses(false))
  }, [phase, user])

  const handleSelectAddress = (addressId) => {
    const addr = savedAddresses.find(a => a.id === addressId)
    if (!addr) return
    trigger('selection')
    setSelectedAddressId(addressId)
    setFormData(prev => ({
      ...prev,
      name: addr.full_name || prev.name,
      phone: addr.phone || prev.phone,
      address: addr.address_line_1 + (addr.address_line_2 ? ', ' + addr.address_line_2 : ''),
      city: addr.city,
      state: addr.state,
      zipCode: addr.postal_code,
    }))
  }

  // ── Price calculation ────
  const calculatedQuote = useMemo(function calculateQuote() {
    const questionsList = questions || []
    let totalPercentageAdjustment = 0
    let totalFixedAdjustment = 0

    for (let qIndex = 0; qIndex < questionsList.length; qIndex++) {
      const question = questionsList[qIndex]
      const selectedAnswer = answers[qIndex]
      const isMultiple = question.type === 'multiple'
      const isOppositeMultiple = question.type === 'opposite_multiple'

      if (isOppositeMultiple && question.ans) {
        const selected = Array.isArray(selectedAnswer) ? selectedAnswer : []
        for (let i = 0; i < question.ans.length; i++) {
          if (!selected.includes(i)) {
            const answer = question.ans[i]
            totalPercentageAdjustment += parsePercentage(answer.persentage)
            totalFixedAdjustment += parseFixed(answer.fixed)
          }
        }
      } else if (isMultiple && Array.isArray(selectedAnswer)) {
        for (let i = 0; i < selectedAnswer.length; i++) {
          const answerIndex = selectedAnswer[i]
          if (question.ans && question.ans[answerIndex]) {
            const answer = question.ans[answerIndex]
            totalPercentageAdjustment += parsePercentage(answer.persentage)
            totalFixedAdjustment += parseFixed(answer.fixed)
          }
        }
      } else if (selectedAnswer !== undefined && question.ans && question.ans[selectedAnswer]) {
        const answer = question.ans[selectedAnswer]
        totalPercentageAdjustment += parsePercentage(answer.persentage)
        totalFixedAdjustment += parseFixed(answer.fixed)
      }
    }

    const afterPercentage = basePrice * (1 + totalPercentageAdjustment / 100)
    let finalValue = afterPercentage + totalFixedAdjustment
    const appliedMinPrice = minPrice && finalValue < minPrice

    if (minPrice && finalValue < minPrice) finalValue = minPrice
    finalValue = Math.max(0, finalValue)

    return {
      value: finalValue,
      percentageAdjustment: totalPercentageAdjustment,
      fixedAdjustment: totalFixedAdjustment,
      deduction: totalPercentageAdjustment < 0 ? Math.abs(totalPercentageAdjustment) : 0,
      bonus: totalPercentageAdjustment > 0 ? totalPercentageAdjustment : 0,
      isZeroValue: finalValue === 0,
      appliedMinPrice,
    }
  }, [answers, questions, basePrice, minPrice])

  // ── Price count-up animation when entering result phase ──
  const hasAnimatedRef = useRef(false)
  useEffect(() => {
    if (phase !== 'result') {
      hasAnimatedRef.current = false
      return
    }
    if (hasAnimatedRef.current) return // Already animated, don't restart

    // Scroll the actual overflow container (not window)
    const scrollContainer = document.querySelector('[style*="view-transition-name: transition-page"]')
    if (scrollContainer) scrollContainer.scrollTo({ top: 0 })
    else window.scrollTo({ top: 0 })
    setAnimatedPrice(0)

    const target = calculatedQuote.value
    let cancelled = false
    let startTime = null

    const tick = (now) => {
      if (cancelled) return
      if (startTime === null) startTime = now

      const elapsed = now - startTime
      const duration = 500

      if (elapsed < duration) {
        const progress = elapsed / duration
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimatedPrice(target * eased)
        requestAnimationFrame(tick)
      } else {
        setAnimatedPrice(target)
        hasAnimatedRef.current = true
        try { triggerRef.current() } catch (_) {}
      }
    }

    requestAnimationFrame(tick)
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Step completion ────────────────
  const isStepComplete = (stepIndex) => {
    const questionsList = questions || []
    if (stepIndex < questionsList.length) {
      const question = questionsList[stepIndex]
      const answer = answers[stepIndex]
      if (question.required === false) return true
      if (question.type === 'multiple' || question.type === 'opposite_multiple') {
        if (question.type === 'opposite_multiple') return true
        return Array.isArray(answer) && answer.length > 0
      }
      return answer !== undefined
    }
    return true
  }

  const canProceed = isStepComplete(currentStep)

  // ── Answer selection + auto-advance ──
  const handleAnswerSelect = useCallback((questionIndex, answerIndex) => {
    const question = questions?.[questionIndex]
    const isMultiple = question?.type === 'multiple' || question?.type === 'opposite_multiple'

    setAnswers(prev => {
      if (isMultiple) {
        const currentAnswers = Array.isArray(prev[questionIndex]) ? prev[questionIndex] : []
        const isSelected = currentAnswers.includes(answerIndex)
        return {
          ...prev,
          [questionIndex]: isSelected
            ? currentAnswers.filter(idx => idx !== answerIndex)
            : [...currentAnswers, answerIndex]
        }
      }
      return { ...prev, [questionIndex]: answerIndex }
    })

    // Auto-advance for single-select after brief delay
    if (!isMultiple) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      autoAdvanceTimer.current = setTimeout(() => {
        setDirection(1)
        setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
      }, 400)
    }
  }, [questions, totalSteps])

  // Cleanup timer
  useEffect(() => () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
  }, [])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      trigger('light')
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      trigger('light')
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  // ── Transition to result phase ─────────────────────────
  const handleViewEstimate = () => {
    trigger([
      { duration: 600 },
    ], { intensity: 1 })

    // Validate all required questions are answered
    const unansweredQuestions = (questions || []).filter((q, idx) => {
      if (q.required === false) return false
      const answer = answers[idx]
      if (q.type === 'multiple') return !Array.isArray(answer) || answer.length === 0
      return answer === undefined
    })
    if (unansweredQuestions.length > 0) {
      trigger('error')
      toast.error(t('errorAnswerRequired'))
      return
    }

    // Build answers summary
    const summary = (questions || []).map((q, qIndex) => {
      const selectedAnswer = answers[qIndex]
      const isMultiple = q.type === 'multiple' || q.type === 'opposite_multiple'

      if (isMultiple) {
        const selected = Array.isArray(selectedAnswer) ? selectedAnswer : []
        if (q.type === 'opposite_multiple') {
          const uncheckedAnswers = (q.ans || []).filter((_, i) => !selected.includes(i))
          return {
            questionIndex: qIndex, questionText: q.title, questionType: 'opposite_multiple',
            answerIndices: selected, answerTexts: selected.map(i => q.ans?.[i]?.content || 'N/A'),
            percentageAdjustment: uncheckedAnswers.reduce((sum, a) => sum + parsePercentage(a?.persentage), 0),
            fixedAdjustment: uncheckedAnswers.reduce((sum, a) => sum + parseFixed(a?.fixed), 0)
          }
        }
        const selectedAnswers = selected.map(ansIdx => q.ans && q.ans[ansIdx]).filter(Boolean)
        return {
          questionIndex: qIndex, questionText: q.title, questionType: 'multiple',
          answerIndices: selected, answerTexts: selectedAnswers.map(a => a?.content || 'Not answered'),
          percentageAdjustment: selectedAnswers.reduce((sum, a) => sum + parsePercentage(a?.persentage), 0),
          fixedAdjustment: selectedAnswers.reduce((sum, a) => sum + parseFixed(a?.fixed), 0)
        }
      }
      const answer = q.ans && q.ans[selectedAnswer]
      return {
        questionIndex: qIndex, questionText: q.title, questionType: 'single',
        answerIndex: selectedAnswer, answerText: answer?.content || 'Not answered',
        percentageAdjustment: parsePercentage(answer?.persentage),
        fixedAdjustment: parseFixed(answer?.fixed)
      }
    })

    setAnswersSummary(summary)
    setPhase('result')
  }

  // ── Result phase: form handling ─────────────────────────
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRequestSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      trigger('error')
      toast.error(t('errorFieldsRequired'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      trigger('error')
      toast.error(t('errorInvalidEmail'))
      return
    }
    if (!shippingMethod) {
      trigger('warning')
      toast.error(t('errorShippingRequired'))
      return
    }

    trigger('nudge')
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false)
    setSubmitting(true)

    try {
      // 1. Submit quote
      const quoteRes = await fetch('/api/tradeins/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          answers: answersSummary,
          estimatedValue: calculatedQuote.value,
          totalDeduction: calculatedQuote.deduction,
          totalBonus: calculatedQuote.bonus,
          basePrice,
          depreciation,
          priceSource: 'database',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          notes: formData.notes || null,
          userId: user?.id || null
        })
      })

      const quoteData = await quoteRes.json()
      if (!quoteRes.ok) throw new Error(quoteData.error || 'Failed to submit quote request')

      const quoteId = quoteData.quote?.id

      // 2. Submit shipping method & notify admins
      if (quoteId) {
        const shipRes = await fetch('/api/tradeins/quote/shipping', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId,
            shippingMethod,
            productTitle: product.title,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone || null,
            customerAddress: formData.address,
            customerCity: formData.city,
            customerState: formData.state,
            customerZipCode: formData.zipCode,
            estimatedValue: calculatedQuote.value,
            notes: formData.notes || null,
          })
        })

        const shipData = await shipRes.json()
        if (!shipRes.ok) throw new Error(shipData.error || 'Failed to confirm shipping method')
      }

      // 3. Save address to address book if requested
      if (addressMode === 'new' && saveNewAddress && user && formData.address) {
        try {
          await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: formData.name,
              phone: formData.phone || null,
              address_line_1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US',
              is_default: savedAddresses.length === 0,
            })
          })
        } catch (_) { /* non-critical */ }
      }

      trigger('success')
      setPhase('submitted')
      toast.success(t('successMessage'))
    } catch (error) {
      trigger('error')
      console.error('Error submitting quote:', error)
      toast.error(error.message || t('errorSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render question step ───────────────────────
  const renderQuestionStep = () => {
    const questionsList = questions || []
    if (currentStep >= questionsList.length) return null

    const question = questionsList[currentStep]
    const questionAnswers = question.ans || []
    const isMultiple = question.type === 'multiple' || question.type === 'opposite_multiple'
    const isOppositeMultiple = question.type === 'opposite_multiple'
    const currentAnswers = answers[currentStep]

    const isAnswerSelected = (ansIdx) => {
      if (isMultiple) return Array.isArray(currentAnswers) && currentAnswers.includes(ansIdx)
      return currentAnswers === ansIdx
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">{question.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {question.required !== false ? (
                <span className="text-xs text-red-500">{t('required')}</span>
              ) : (
                <span className="text-xs text-muted-foreground">{t('optional')}</span>
              )}
              {isMultiple && (
                <span className="text-xs text-muted-foreground ml-1">
                  · {isOppositeMultiple ? t('checkAllApply') : t('multiSelect')}
                </span>
              )}
            </div>
          </div>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          {getImageUrl(question.img) && (
            <img
              src={getImageUrl(question.img)}
              alt={question.title}
              className="max-w-full h-auto max-h-40 rounded-lg border border-border object-contain"
            />
          )}
        </div>

        <div className="space-y-2">
          {questionAnswers.map((answer, ansIdx) => {
            const isSelected = isAnswerSelected(ansIdx)

            return (
              <motion.div
                key={ansIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ansIdx * 0.04, duration: 0.2 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    handleAnswerSelect(currentStep, ansIdx)
                    trigger()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleAnswerSelect(currentStep, ansIdx)
                    }
                  }}
                  className={cn(
                    "w-full text-left p-4 border rounded-xl transition-all cursor-pointer active:scale-[0.98]",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isMultiple && "rounded-md",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>

                    {getImageUrl(answer.img) && (
                      <img
                        src={getImageUrl(answer.img)}
                        alt={answer.content}
                        className="w-12 h-12 rounded-lg border border-border object-cover shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <span className={cn(
                            "font-medium text-sm",
                            isSelected ? "text-foreground" : "text-foreground/80"
                          )}>{answer.content}</span>
                          {answer.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{answer.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const isLastStep = currentStep === totalSteps - 1

  // ══════════════════════════════════════════════════
  // ── Submitted phase ──────────────────────────
  // ══════════════════════════════════════════════════
  if (phase === 'submitted') {
    const steps = shippingMethod === 'depxtech_box'
      ? [t('stepDepxtech1'), t('stepDepxtech2'), t('stepDepxtech3'), t('stepDepxtech4')]
      : [t('stepOwnBox1'), t('stepOwnBox2'), t('stepOwnBox3'), t('stepOwnBox4')]

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="min-h-screen"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t('quoteSubmitted')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('quoteSubmittedDesc')}
            </p>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-6">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">{t('estimatedValue')}</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(calculatedQuote.value)}
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1.5">
                {t('finalValueNote')}
              </p>
            </div>

            {/* 14-day shipping deadline warning */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg mb-6 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t('shippingDeadlineWarning')}
              </p>
            </div>

            {/* Shipping method badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground mb-6">
              {shippingMethod === 'depxtech_box' ? (
                <Package className="w-4 h-4" />
              ) : (
                <BoxIcon className="w-4 h-4" />
              )}
              {shippingMethod === 'depxtech_box' ? t('depxtechBox') : t('ownBox')}
            </div>

            <div className="text-left bg-muted/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3">{t('whatsNext')}</p>
              <div className="space-y-2.5">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t('freeShipping')}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t('dataWiping')}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t('response24h')}
              </span>
            </div>

            <TransitionLink href={`/trade/product/${product.id}`}>
              <Button variant="outline" className="mt-6 w-full">
                {t('submitAnother')}
              </Button>
            </TransitionLink>
            <TransitionLink href="/account/trade-ins">
              <Button variant="outline" className="mt-2 w-full">
                {t('viewMyTradeIns')}
              </Button>
            </TransitionLink>
            <TransitionLink href="/">
              <Button variant="ghost" className="mt-2 w-full gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                {t('backToHome')}
              </Button>
            </TransitionLink>
          </div>
        </div>
      </motion.div>
    )
  }

  // ══════════════════════════════════════════════════
  // ── Result phase ──────────────────────────
  // ══════════════════════════════════════════════════
  if (phase === 'result') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Desktop two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
            {/* Left: Product Image (desktop only) */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="sticky top-8"
              >
                {product.imgs && product.imgs.length > 0 && (
                  <div className="relative w-full aspect-square rounded-2xl bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 p-8 shadow-sm border border-border/50">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={product.imgs[0]}
                        alt={product.title + " - DepxTech"}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </motion.div>
                  </div>
                )}
                <div className="mt-4 text-center">
                  <h2 className="font-bold text-lg text-foreground">{product.title}</h2>
                  {product.brand && product.series && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.brand} • {product.series}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right: Form */}
            <div className="space-y-6">
              {/* Hero estimate display with count-up animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div
                  className={cn(
                    "relative overflow-hidden p-6 rounded-2xl border mb-0",
                    calculatedQuote.isZeroValue
                      ? "bg-linear-to-br from-orange-50 via-orange-50/50 to-amber-50 dark:from-orange-950/40 dark:via-orange-950/20 dark:to-amber-950/30 border-orange-200/70 dark:border-orange-800/50"
                      : "bg-linear-to-br from-emerald-50 via-emerald-50/50 to-teal-50 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-teal-950/30 border-emerald-200/70 dark:border-emerald-800/50"
                  )}
                >
                  {/* Decorative background sparkles */}
                  {!calculatedQuote.isZeroValue && (
                    <>
                      <div className="absolute top-3 right-4 opacity-15">
                        <Sparkles className="w-5 h-5 text-emerald-400 dark:text-emerald-500" />
                      </div>
                      <div className="absolute bottom-4 right-12 opacity-10">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400 dark:text-teal-500" />
                      </div>
                      <div className="absolute top-6 right-20 opacity-8">
                        <Sparkles className="w-4 h-4 text-emerald-300 dark:text-emerald-600" />
                      </div>
                    </>
                  )}

                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-2",
                    calculatedQuote.isZeroValue ? "text-orange-600/80 dark:text-orange-400/80" : "text-emerald-600/80 dark:text-emerald-400/80"
                  )}>
                    {calculatedQuote.isZeroValue ? t('freeRecycling') : t('estimatedValue')}
                  </p>
                  <p className={cn(
                      "text-4xl sm:text-5xl font-extrabold tabular-nums",
                      calculatedQuote.isZeroValue
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {formatCurrency(animatedPrice)}
                  </p>
                  <div>
                    <p className="text-xs text-muted-foreground mt-3">{t('finalValueNote')}</p>
                    <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">{t('shippingDeadlineWarning')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping method selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-1 mb-3">
                  <h3 className="text-base font-semibold text-foreground">{t('chooseShippingMethod')}: <span className="text-red-500 text-sm">*</span></h3>
                  <p className="text-sm text-muted-foreground">{t('chooseShippingMethodDesc')}</p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: DepxTech box */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setShippingMethod('depxtech_box')
                      trigger()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setShippingMethod('depxtech_box')
                      }
                    }}
                    className={cn(
                      "w-full text-left p-5 border rounded-2xl transition-all cursor-pointer",
                      shippingMethod === 'depxtech_box'
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <motion.div
                        animate={shippingMethod === 'depxtech_box' ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={cn(
                          "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          shippingMethod === 'depxtech_box'
                            ? "bg-primary text-white shadow-sm"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Package className="w-4.5 h-4.5" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{t('depxtechBox')}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('depxtechBoxShipsIn')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{t('depxtechBoxDesc')}</p>
                      </div>
                      {shippingMethod === 'depxtech_box' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Option 2: Own box */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setShippingMethod('own_box')
                      trigger()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setShippingMethod('own_box')
                      }
                    }}
                    className={cn(
                      "w-full text-left p-5 border rounded-2xl transition-all cursor-pointer",
                      shippingMethod === 'own_box'
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <motion.div
                        animate={shippingMethod === 'own_box' ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={cn(
                          "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          shippingMethod === 'own_box'
                            ? "bg-primary text-white shadow-sm"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <BoxIcon className="w-4.5 h-4.5" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground">{t('ownBox')}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{t('ownBoxDesc')}</p>
                      </div>
                      {shippingMethod === 'own_box' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Contact form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="p-5 rounded-2xl border border-border/60 bg-muted/20">
                    <div className="space-y-1 mb-4">
                      <h3 className="text-base font-semibold text-foreground">{t('contactInfo')}</h3>
                      <p className="text-sm text-muted-foreground">{t('contactDesc')}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-sm font-medium">
                            {t('fullName')} <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="name" type="text" value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder={t('namePlaceholder')} className="h-11 pl-9 rounded-xl" required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-sm font-medium">
                            {t('emailAddress')} <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email" type="email" value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder={t('emailPlaceholder')} className="h-11 pl-9 rounded-xl" required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          {t('phoneNumber')} <span className="text-xs text-muted-foreground">({t('optional')})</span>
                        </Label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone" type="tel" value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder={t('phonePlaceholder')} className="h-11 pl-9 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border/40 my-1" />

                      {/* Address section */}
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            {t('address')} <span className="text-red-500">*</span>
                          </Label>
                          {savedAddresses.length > 0 && (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => { trigger('selection'); setAddressMode('saved') }}
                                className={cn(
                                  "text-xs px-2.5 py-1 rounded-lg transition-colors",
                                  addressMode === 'saved'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {t('savedAddresses')}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  trigger('selection')
                                  setAddressMode('new')
                                  setSelectedAddressId(null)
                                  setFormData(prev => ({ ...prev, address: '', city: '', state: '', zipCode: '', phone: '' }))
                                }}
                                className={cn(
                                  "text-xs px-2.5 py-1 rounded-lg transition-colors",
                                  addressMode === 'new'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {t('newAddress')}
                              </button>
                            </div>
                          )}
                        </div>

                        {loadingAddresses ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : addressMode === 'saved' && savedAddresses.length > 0 ? (
                          <div className="space-y-2">
                            {savedAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelectAddress(addr.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectAddress(addr.id) } }}
                                className={cn(
                                  "flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all",
                                  selectedAddressId === addr.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                                )}
                              >
                                <div className={cn(
                                  "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all",
                                  selectedAddressId === addr.id ? "bg-primary border-primary" : "border-muted-foreground/30"
                                )}>
                                  {selectedAddressId === addr.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{addr.full_name}</span>
                                    {addr.is_default && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t('default')}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {addr.address_line_1}{addr.address_line_2 && `, ${addr.address_line_2}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {addr.city}, {addr.state} {addr.postal_code}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1.5">
                              <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="address" type="text" value={formData.address}
                                  onChange={(e) => handleInputChange('address', e.target.value)}
                                  placeholder={t('addressPlaceholder')} className="h-11 pl-9 rounded-xl" required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="city" className="text-sm font-medium">
                                  {t('city')} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="city" type="text" value={formData.city}
                                  onChange={(e) => handleInputChange('city', e.target.value)}
                                  placeholder={t('cityPlaceholder')} className="h-11 rounded-xl" required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="state" className="text-sm font-medium">
                                  {t('state')} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="state" type="text" value={formData.state}
                                  onChange={(e) => handleInputChange('state', e.target.value)}
                                  placeholder={t('statePlaceholder')} className="h-11 rounded-xl" required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="zipCode" className="text-sm font-medium">
                                  {t('zipCode')} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="zipCode" type="text" value={formData.zipCode}
                                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                  placeholder={t('zipCodePlaceholder')} className="h-11 rounded-xl" required
                                />
                              </div>
                            </div>
                            {user && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={saveNewAddress}
                                  onChange={(e) => { trigger('selection'); setSaveNewAddress(e.target.checked) }}
                                  className="rounded border-border"
                                />
                                <span className="text-xs text-muted-foreground">{t('saveToAddressBook')}</span>
                              </label>
                            )}
                          </>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          {t('additionalNotes')} <span className="text-xs text-muted-foreground">({t('optional')})</span>
                        </Label>
                        <div className="relative">
                          <MessageSquareIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <textarea
                            id="notes"
                            className="w-full min-h-[80px] pl-9 px-3 py-2.5 border border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-sm"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder={t('notesPlaceholder')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                  >
                    <Button
                      type="submit"
                      disabled={submitting || !formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode || !shippingMethod}
                      className="w-full gap-2 h-12 text-base rounded-xl group"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t('submitting')}</>
                      ) : (
                        <>{t('getMyQuote')} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
                      )}
                    </Button>
                  </motion.div>

                  {/* Trust badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground"
                  >
                    {[
                      { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, text: t('freeShipping') },
                      { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, text: t('dataWiping') },
                      { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, text: t('response24h') },
                    ].map((badge, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="flex items-center gap-1"
                      >
                        {badge.icon} {badge.text}
                      </motion.span>
                    ))}
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </div>

          {/* Confirmation Dialog */}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('confirmSubmitTitle')}</DialogTitle>
                <DialogDescription>{t('confirmSubmitDesc')}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('product')}</span>
                  <span className="font-medium text-foreground">{product.title}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('estimatedValue')}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(calculatedQuote.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('shippingMethod')}</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    {shippingMethod === 'depxtech_box' ? <Package className="w-3.5 h-3.5" /> : <BoxIcon className="w-3.5 h-3.5" />}
                    {shippingMethod === 'depxtech_box' ? t('depxtechBox') : t('ownBox')}
                  </span>
                </div>
                <div className="border-t border-border pt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('fullName')}</span>
                    <span className="font-medium text-foreground">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('emailAddress')}</span>
                    <span className="font-medium text-foreground">{formData.email}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('phoneNumber')}</span>
                      <span className="font-medium text-foreground">{formData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('address')}</span>
                    <span className="font-medium text-foreground text-right">{formData.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('cityStateZip')}</span>
                    <span className="font-medium text-foreground">{formData.city}, {formData.state} {formData.zipCode}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  {t('cancelButton')}
                </Button>
                <Button onClick={handleConfirmSubmit} className="gap-2">
                  {t('confirmSubmitButton')} <ChevronRight className="w-4 h-4" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
    )
  }

  // ══════════════════════════════════════════════════
  // ── Questions phase (default) ──────────────────────────
  // ══════════════════════════════════════════════════
  return (
    <div className="min-h-screen pb-24">
      {/* Top Banner */}
      <div className="border-b border-border sticky -top-1 z-40 backdrop-blur-lg bg-background/95 pt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">{product.title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('answerQuestions')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <span className="text-primary font-bold">{currentStep + 1}</span>
              <span>/</span>
              <span>{totalSteps}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Desktop two-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          {/* Left: Product Image (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-[120px]">
              {product.imgs && product.imgs.length > 0 ? (
                <div
                  className="relative w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700/50 p-8"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={product.imgs[0]}
                      alt={product.title + " - DepxTech"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700/50 p-8 flex items-center justify-center">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
              <div className="mt-4 text-center">
                <h2
                  className="font-bold text-lg text-foreground"
                >
                  {product.title}
                </h2>
                {product.brand && product.series && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.brand} • {product.series}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Questions Form */}
          <div className="space-y-6">
        {/* Animated step content */}
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderQuestionStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button" variant="ghost" onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('back')}
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleViewEstimate}
              disabled={!canProceed}
              className="gap-2 px-6"
            >
              {t('viewEstimate')} <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button" onClick={handleNext}
              disabled={!canProceed} className="gap-1.5 px-5"
            >
              {t('continue')} <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
