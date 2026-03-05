"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRightLeft,
  CalendarIcon,
  DollarSignIcon,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  CircleDot,
  ListChecks,
  Cable
} from "lucide-react"
import { toast } from "sonner"
import { TransitionLink } from "@/components/ui/pageTransitions"
import { useTranslations } from 'next-intl'

const STATUS_STEPS = ['pending', 'approved', 'completed']

function ProgressTracker({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status)
  const isRejected = status === 'rejected'

  return (
    <div className="flex items-center gap-1 w-full">
      {STATUS_STEPS.map((step, i) => {
        const isActive = !isRejected && i <= currentIndex
        const isCurrent = !isRejected && i === currentIndex
        return (
          <div key={step} className="flex items-center flex-1 gap-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0 ${
              isRejected ? 'bg-red-100 text-red-600' :
              isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
            }`}>
              {isRejected && i === 0 ? <XCircle className="w-3.5 h-3.5" /> :
               isActive && i < currentIndex ? <CheckCircle className="w-3.5 h-3.5" /> :
               isCurrent ? <Clock className="w-3.5 h-3.5" /> :
               i + 1}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full ${
                isRejected ? 'bg-red-200' :
                !isRejected && i < currentIndex ? 'bg-foreground' : 'bg-muted'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function parseCondition(condition) {
  if (!condition) return null
  try {
    const parsed = JSON.parse(condition)
    if (typeof parsed === 'object') return parsed
  } catch {
    // plain string like "Good", "Fair"
  }
  return condition
}

function ConditionDisplay({ quote, t }) {
  const answers = quote.answers
  const accessories = quote.accessories
  const condition = quote.condition

  // New format: answers array
  if (answers && Array.isArray(answers) && answers.length > 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" />
          {t('deviceAssessment')}
        </h4>
        <div className="space-y-2">
          {answers.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CircleDot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <span className="text-muted-foreground">{a.questionText}</span>
                <span className="mx-1.5 text-muted-foreground/50">—</span>
                <span className="font-medium">
                  {a.questionType === 'single' ? a.answerText : (a.answerTexts || []).join(', ')}
                </span>
                {(a.percentageAdjustment !== 0 || a.fixedAdjustment !== 0) && (
                  <span className={`ml-1.5 text-xs ${(a.percentageAdjustment < 0 || a.fixedAdjustment < 0) ? 'text-red-500' : 'text-green-600'}`}>
                    {a.percentageAdjustment !== 0 && `${a.percentageAdjustment > 0 ? '+' : ''}${a.percentageAdjustment}%`}
                    {a.percentageAdjustment !== 0 && a.fixedAdjustment !== 0 && ' '}
                    {a.fixedAdjustment !== 0 && `${a.fixedAdjustment > 0 ? '+' : ''}$${a.fixedAdjustment}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {accessories && Array.isArray(accessories) && accessories.length > 0 && (
          <div className="pt-1">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <Cable className="h-3.5 w-3.5" />
              {t('accessoriesIncluded')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {accessories.map((acc, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-normal">
                  {acc.name}
                  {(acc.price_adjustment > 0 || acc.percentage_adjustment > 0) && (
                    <span className="ml-1 text-green-600">
                      {acc.price_adjustment > 0 && `+$${acc.price_adjustment}`}
                      {acc.percentage_adjustment > 0 && `+${acc.percentage_adjustment}%`}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Legacy: condition is a JSON string containing answers/accessories
  const parsed = parseCondition(condition)
  if (parsed && typeof parsed === 'object' && parsed.answers) {
    return <ConditionDisplay quote={{ ...quote, answers: parsed.answers, accessories: parsed.accessories, condition: null }} t={t} />
  }

  // Legacy: plain string condition
  if (typeof parsed === 'string' || (typeof condition === 'string' && condition)) {
    return (
      <div className="text-sm">
        <span className="text-muted-foreground">{t('condition')}</span>{' '}
        <Badge variant="outline">{condition}</Badge>
      </div>
    )
  }

  return null
}

export default function MyTradeInsPage() {
  const t = useTranslations('account.tradeInsPage')
  const { user } = useAuth()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchQuotes()
    else setLoading(false)
  }, [user])

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/trade-quotes')
      const data = await res.json()
      if (data.success) {
        setQuotes(data.quotes || [])
      } else {
        toast.error(t('errorLoadTradeIns'))
      }
    } catch {
      toast.error(t('errorLoadTradeIns'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{t('approved')}</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">{t('completed')}</Badge>
      case 'rejected':
        return <Badge variant="destructive">{t('rejected')}</Badge>
      case 'pending':
      default:
        return <Badge variant="secondary">{t('submitted')}</Badge>
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return t('statusApproved')
      case 'completed': return t('statusCompleted')
      case 'rejected': return t('statusRejected')
      case 'pending':
      default: return t('statusPending')
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
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-44 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg mt-2" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-20 rounded-full ml-auto" />
                    <Skeleton className="h-6 w-16 rounded-lg mt-2 ml-auto" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress tracker skeleton */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 w-full">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="flex items-center flex-1 gap-1">
                        <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                        {j < 3 && <Skeleton className="h-0.5 flex-1 rounded-full" />}
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-4 w-48 rounded-lg mt-3" />
                </div>
                <Separator className="my-4" />
                {/* Condition skeleton */}
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-4 w-full rounded-lg" />
                  ))}
                </div>
                {/* Price breakdown skeleton */}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <Skeleton className="h-4 w-28 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ArrowRightLeft className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('noTradeIns')}</h2>
            <p className="text-muted-foreground mb-4">{t('noTradeInsDesc')}</p>
            <TransitionLink href="/trade">
              <Button>{t('tradeInDevice')}</Button>
            </TransitionLink>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-4 w-4" />
                      {quote.product_title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('submitted')} {formatDate(quote.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(quote.status)}
                    <p className="text-lg font-semibold mt-1">
                      ${Number(quote.estimated_value).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Tracker */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{t('submitted')}</span>
                    <span>{t('approved')}</span>
                    <span>{t('completed')}</span>
                  </div>
                  <ProgressTracker status={quote.status} />
                  <p className="text-sm text-muted-foreground mt-3">
                    {getStatusLabel(quote.status)}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Device Condition / Answers */}
                <ConditionDisplay quote={quote} t={t} />

                {/* Price Breakdown */}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {quote.base_price && (
                    <p><span className="text-muted-foreground">{t('basePrice')}</span> ${Number(quote.base_price).toFixed(2)}</p>
                  )}
                  {quote.total_deduction > 0 && (
                    <p><span className="text-red-500">{t('deductions')}</span> -${Number(quote.total_deduction).toFixed(2)}</p>
                  )}
                  {quote.total_bonus > 0 && (
                    <p><span className="text-green-600">{t('bonuses')}</span> +${Number(quote.total_bonus).toFixed(2)}</p>
                  )}
                  <p className="flex items-center gap-1">
                    <DollarSignIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('estimatedValue')}</span> <strong>${Number(quote.estimated_value).toFixed(2)}</strong>
                  </p>
                  <p className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('updated')}</span> {formatDate(quote.updated_at)}
                  </p>
                </div>

                {quote.notes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t('notes')}</p>
                      <p className="text-sm">{quote.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
