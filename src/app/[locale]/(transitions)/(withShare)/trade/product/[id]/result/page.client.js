"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  ChevronRight,
  ChevronLeft,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MessageSquareIcon,
  Package,
  BoxIcon,
  Clock,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  MapPinIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useTransitionRouter, TransitionLink } from '@/components/ui/pageTransitions'
import { useParams } from 'next/navigation'
import Image from 'next/image'

export default function TradeResultPageClient({ product }) {
  const { user } = useAuth()
  const t = useTranslations('trade.product')
  const router = useTransitionRouter()
  const params = useParams()
  const locale = params?.locale

  const [quoteData, setQuoteData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Form & submission state
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
  const [submitted, setSubmitted] = useState(false)

  // Shipping method state (selected before submit)
  const [shippingMethod, setShippingMethod] = useState(null)

  // Confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Load data from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('tradeQuoteData')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.productId === product.id) {
          setQuoteData(data)
        } else {
          router.replace(`/trade/product/${product.id}`)
          return
        }
      } else {
        router.replace(`/trade/product/${product.id}`)
        return
      }
    } catch {
      router.replace(`/trade/product/${product.id}`)
      return
    }
    setLoading(false)
  }, [product.id, router])

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ── Open confirmation dialog ─────────────────────────
  const handleRequestSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error(t('errorFieldsRequired'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t('errorInvalidEmail'))
      return
    }
    if (!shippingMethod) {
      toast.error(t('errorShippingRequired'))
      return
    }

    setConfirmOpen(true)
  }

  // ── Confirm & submit quote + shipping ─────────────────────────
  const handleConfirmSubmit = async () => {
    setConfirmOpen(false)
    setSubmitting(true)

    try {
      // 1. Submit quote
      const quoteRes = await fetch('/api/tradeins/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: quoteData.productId,
          productTitle: quoteData.productTitle,
          answers: quoteData.answers,
          estimatedValue: quoteData.calculatedQuote.value,
          totalDeduction: quoteData.calculatedQuote.deduction,
          totalBonus: quoteData.calculatedQuote.bonus,
          basePrice: quoteData.basePrice,
          depreciation: quoteData.depreciation,
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

      const quoteData_ = await quoteRes.json()
      if (!quoteRes.ok) throw new Error(quoteData_.error || 'Failed to submit quote request')

      const quoteId = quoteData_.quote?.id

      // 2. Submit shipping method & notify admins
      if (quoteId) {
        const shipRes = await fetch('/api/tradeins/quote/shipping', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId,
            shippingMethod,
            productTitle: quoteData.productTitle,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone || null,
            customerAddress: formData.address,
            customerCity: formData.city,
            customerState: formData.state,
            customerZipCode: formData.zipCode,
            estimatedValue: quoteData.calculatedQuote.value,
            notes: formData.notes || null,
          })
        })

        const shipData = await shipRes.json()
        if (!shipRes.ok) throw new Error(shipData.error || 'Failed to confirm shipping method')
      }

      setSubmitted(true)
      sessionStorage.removeItem('tradeQuoteData')
      toast.success(t('successMessage'))
    } catch (error) {
      console.error('Error submitting quote:', error)
      toast.error(error.message || t('errorSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / No data state ──────────────────────────
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">{t('submitting')}</span>
        </div>
      </div>
    )
  }

  if (!quoteData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">{t('noQuoteData')}</p>
        <TransitionLink href={`/trade/product/${product.id}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToProduct')}
          </Button>
        </TransitionLink>
      </div>
    )
  }

  const { calculatedQuote } = quoteData

  // ── Success screen ──────────────────────────
  if (submitted) {
    const steps = shippingMethod === 'depxtech_box'
      ? [t('stepDepxtech1'), t('stepDepxtech2'), t('stepDepxtech3'), t('stepDepxtech4')]
      : [t('stepOwnBox1'), t('stepOwnBox2'), t('stepOwnBox3'), t('stepOwnBox4')]

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-6 md:p-8"
      >
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
                <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {t('onlineBonusIncluded', { amount: formatCurrency(Math.round(calculatedQuote.value * 0.0909)) })}
                  </span>
                </div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
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
      </motion.div>
    )
  }

  // ── Main: Estimate + Shipping selection + Contact form ──────────────────────────
  return (
    <div>
      {/* Back button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.back()}
        className="gap-1.5 mb-6 -ml-2"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('back')}
      </Button>

      {/* Desktop two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* Left: Product Image (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            {product.imgs && product.imgs.length > 0 && (
              <div
                className="relative w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700/50 p-8"
                style={{ viewTransitionName: `product-image-${product.id}` }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={product.imgs[0]}
                    alt={product.title + " - DepxTech"}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <div className="mt-4 text-center">
              <h2
                className="font-bold text-lg text-foreground"
                style={{ viewTransitionName: `product-title-${product.id}` }}
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

        {/* Right: Form */}
        <div>

        {/* Estimate display */}
        <div
          className={cn(
            "p-5 rounded-xl border mb-6",
            calculatedQuote.isZeroValue
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
              : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
          )}
          style={{ viewTransitionName: `price-display-${product.id}` }}
        >
          <p className={cn(
            "text-xs font-medium mb-1",
            calculatedQuote.isZeroValue ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {calculatedQuote.isZeroValue ? t('freeRecycling') : t('estimatedValue')}
          </p>
          <p className={cn(
            "text-3xl font-bold",
            calculatedQuote.isZeroValue ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {formatCurrency(calculatedQuote.value)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {calculatedQuote.deduction > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                -{calculatedQuote.deduction}%
              </span>
            )}
            {calculatedQuote.bonus > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                +{calculatedQuote.bonus}%
              </span>
            )}
          </div>
          {!calculatedQuote.isZeroValue && calculatedQuote.value > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">
                {t('onlineBonusIncluded', { amount: formatCurrency(Math.round(calculatedQuote.value * 0.0909)) })}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">{t('finalValueNote')}</p>
          <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">{t('shippingDeadlineWarning')}</p>
          </div>
        </div>

        {/* Shipping method selection */}
        <div className="mb-6">
          <div className="space-y-1 mb-3">
            <h3 className="text-base font-semibold text-foreground">{t('chooseShippingMethod')}</h3>
            <p className="text-sm text-muted-foreground">{t('chooseShippingMethodDesc')}</p>
          </div>

          <div className="space-y-3">
            {/* Option 1: DepxTech box */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShippingMethod('depxtech_box')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setShippingMethod('depxtech_box')
                }
              }}
              className={cn(
                "w-full text-left p-4 border rounded-xl transition-all cursor-pointer active:scale-[0.98]",
                shippingMethod === 'depxtech_box'
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  shippingMethod === 'depxtech_box'
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Package className="w-4 h-4" />
                </div>
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
              </div>
            </div>

            {/* Option 2: Own box */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShippingMethod('own_box')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setShippingMethod('own_box')
                }
              }}
              className={cn(
                "w-full text-left p-4 border rounded-xl transition-all cursor-pointer active:scale-[0.98]",
                shippingMethod === 'own_box'
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  shippingMethod === 'own_box'
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  <BoxIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{t('ownBox')}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{t('ownBoxDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{t('contactInfo')}</h3>
            <p className="text-sm text-muted-foreground">{t('contactDesc')}</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('fullName')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name" type="text" value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('namePlaceholder')} className="h-11 pl-9" required
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
                  placeholder={t('emailPlaceholder')} className="h-11 pl-9" required
                />
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
                  placeholder={t('phonePlaceholder')} className="h-11 pl-9"
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">
                {t('address')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address" type="text" value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('addressPlaceholder')} className="h-11 pl-9" required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-medium">
                  {t('city')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city" type="text" value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={t('cityPlaceholder')} className="h-11" required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-sm font-medium">
                  {t('state')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state" type="text" value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder={t('statePlaceholder')} className="h-11" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="zipCode" className="text-sm font-medium">
                {t('zipCode')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode" type="text" value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder={t('zipCodePlaceholder')} className="h-11" required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">
                {t('additionalNotes')} <span className="text-xs text-muted-foreground">({t('optional')})</span>
              </Label>
              <div className="relative">
                <MessageSquareIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  id="notes"
                  className="w-full min-h-[80px] pl-9 px-3 py-2.5 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-sm"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder={t('notesPlaceholder')}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode || !shippingMethod}
            className="w-full gap-2 mt-4"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t('submitting')}</>
            ) : (
              <>{t('getMyQuote')} <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-3 text-xs text-muted-foreground">
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
        </form>
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
              <span className="font-medium text-foreground">{quoteData.productTitle}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('estimatedValue')}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(calculatedQuote.value)}
              </span>
            </div>
            {!calculatedQuote.isZeroValue && calculatedQuote.value > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pl-1">
                <Sparkles className="w-3 h-3" />
                <span>{t('onlineBonusIncluded', { amount: formatCurrency(Math.round(calculatedQuote.value * 0.0909)) })}</span>
              </div>
            )}
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
  )
}
