"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useParams } from 'next/navigation'
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
  const t = useTranslations('trade.product')
  const router = useTransitionRouter()
  const params = useParams()
  const locale = params?.locale

  const [answers, setAnswers] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [pricePulse, setPricePulse] = useState(false)
  const autoAdvanceTimer = useRef(null)

  const totalSteps = questions?.length || 1

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
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

  // Pulse price when it changes
  const prevValueRef = useRef(calculatedQuote.value)
  useEffect(() => {
    if (prevValueRef.current !== calculatedQuote.value) {
      setPricePulse(true)
      const t = setTimeout(() => setPricePulse(false), 500)
      prevValueRef.current = calculatedQuote.value
      return () => clearTimeout(t)
    }
  }, [calculatedQuote.value])

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
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  // ── Navigate to result page ─────────────────────────
  const handleViewEstimate = () => {
    // Validate all required questions are answered
    const unansweredQuestions = (questions || []).filter((q, idx) => {
      if (q.required === false) return false
      const answer = answers[idx]
      if (q.type === 'multiple') return !Array.isArray(answer) || answer.length === 0
      return answer === undefined
    })
    if (unansweredQuestions.length > 0) {
      toast.error(t('errorAnswerRequired'))
      return
    }

    // Build answers summary
    const answersSummary = (questions || []).map((q, qIndex) => {
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

    // Store data in sessionStorage for the result page
    sessionStorage.setItem('tradeQuoteData', JSON.stringify({
      productId: product.id,
      productTitle: product.title,
      answers: answersSummary,
      calculatedQuote,
      basePrice,
      depreciation,
      minPrice,
    }))

    const resultUrl = locale ? `/${locale}/trade/product/${product.id}/result` : `/trade/product/${product.id}/result`
    router.push(resultUrl)
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
            const percentage = parsePercentage(answer.persentage)
            const fixed = parseFixed(answer.fixed)
            const isZeroValueAnswer = percentage <= -100

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
                  onClick={() => handleAnswerSelect(currentStep, ansIdx)}
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
                      : "border-border hover:border-primary/30 hover:bg-muted/30",
                    isZeroValueAnswer && isSelected && "border-orange-400 bg-orange-50 dark:bg-orange-950/30 ring-orange-200"
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
                          {isZeroValueAnswer && (
                            <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">{t('noValue')}</span>
                          )}
                          {answer.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{answer.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {percentage !== 0 && !isZeroValueAnswer && (
                            <span className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded",
                              percentage > 0
                                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {percentage > 0 ? '+' : ''}{percentage}%
                            </span>
                          )}
                          {fixed !== 0 && !isZeroValueAnswer && (
                            <span className={cn(
                              "text-xs font-medium px-1.5 py-0.5 rounded",
                              fixed > 0
                                ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {fixed > 0 ? '+' : ''}{formatCurrency(fixed)}
                            </span>
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

  return (
    <div className="min-h-screen pb-24">
      {/* Top Banner */}
      <div className="border-b border-border sticky top-0 z-40 backdrop-blur-lg bg-background/95">
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
          <div className="lg:block">
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
          {/* Animated price display */}
          <div
            className={cn(
              "p-4 rounded-xl border transition-colors",
              calculatedQuote.isZeroValue
                ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-xs font-medium",
                  calculatedQuote.isZeroValue ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {calculatedQuote.isZeroValue ? t('freeRecycling') : t('yourEstimate')}
                </p>
                <motion.p
                  className={cn(
                    "text-2xl font-bold mt-0.5",
                    calculatedQuote.isZeroValue ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400",
                    pricePulse && "animate-pulse"
                  )}
                  key={calculatedQuote.value}
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {formatCurrency(calculatedQuote.value)}
                </motion.p>
              </div>
              <div className="flex items-center gap-2">
                {calculatedQuote.deduction > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
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
                    {t('minPrice')}
                  </span>
                )}
              </div>
            </div>
            {!calculatedQuote.isZeroValue && calculatedQuote.value > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {t('onlineBonusIncluded', { amount: formatCurrency(Math.round(calculatedQuote.value * 0.0909)) })}
                </span>
              </div>
            )}
            {calculatedQuote.isZeroValue && (
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-2">
                {t('freeRecyclingDesc')}
              </p>
            )}
          </div>

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
