'use client'

import { useAuth } from '@/lib/auth'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, Eye, ArrowRightLeft, DollarSign, Clock, CheckCircle, XCircle, CircleDot, ListChecks, Cable, Package, BoxIcon } from 'lucide-react'

function parseCondition(condition) {
  if (!condition) return null
  try {
    const parsed = JSON.parse(condition)
    if (typeof parsed === 'object') return parsed
  } catch { /* plain string */ }
  return condition
}

function ConditionDisplay({ quote }) {
  const answers = quote.answers
  const accessories = quote.accessories
  const condition = quote.condition

  if (answers && Array.isArray(answers) && answers.length > 0) {
    return (
      <div className="space-y-3">
        <h4 className="font-semibold flex items-center gap-1.5 text-sm">
          <ListChecks className="h-4 w-4" />
          Device Assessment
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
            <h4 className="font-semibold flex items-center gap-1.5 text-sm mb-2">
              <Cable className="h-4 w-4" />
              Accessories Included
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {accessories.map((acc, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-normal">
                  {acc.name}
                  {(acc.price_adjustment > 0 || acc.percentage_adjustment > 0) && (
                    <span className="ml-1 text-green-600">
                      {acc.price_adjustment > 0 && `+$${acc.price_adjustment}`}
                      {acc.percentage_adjustment > 0 && ` +${acc.percentage_adjustment}%`}
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

  const parsed = parseCondition(condition)
  if (parsed && typeof parsed === 'object' && parsed.answers) {
    return <ConditionDisplay quote={{ ...quote, answers: parsed.answers, accessories: parsed.accessories, condition: null }} />
  }

  if (typeof parsed === 'string' || (typeof condition === 'string' && condition)) {
    return (
      <div className="text-sm">
        <span className="text-muted-foreground">Condition:</span>{' '}
        <Badge variant="outline">{condition}</Badge>
      </div>
    )
  }

  return null
}

function ShippingMethodBadge({ method }) {
  if (!method) return <span className="text-xs text-muted-foreground">—</span>
  if (method === 'depxtech_box') {
    return (
      <Badge variant="secondary" className="text-xs font-normal gap-1">
        <Package className="w-3 h-3" />
        DepxTech Kit
      </Badge>
    )
  }
  if (method === 'own_box') {
    return (
      <Badge variant="outline" className="text-xs font-normal gap-1">
        <BoxIcon className="w-3 h-3" />
        Own Box
      </Badge>
    )
  }
  return <Badge variant="outline" className="text-xs">{method}</Badge>
}

export default function AdminTradeQuotes() {
  const { user, loading } = useAuth()
  const router = useTransitionRouter()
  const t = useTranslations('admin.tradeQuotes')
  const [quotes, setQuotes] = useState([])
  const [filteredQuotes, setFilteredQuotes] = useState([])
  const [quotesLoading, setQuotesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchQuotes()
  }, [])

  useEffect(() => {
    let filtered = quotes

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(q =>
        q.product_title?.toLowerCase().includes(term) ||
        q.customer_name?.toLowerCase().includes(term) ||
        q.customer_email?.toLowerCase().includes(term) ||
        q.customer_phone?.includes(term)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter)
    }

    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, statusFilter])

  useEffect(() => {
    const totalValue = quotes.reduce((sum, q) => sum + (q.estimated_value || 0), 0)
    const pending = quotes.filter(q => q.status === 'pending').length
    const approved = quotes.filter(q => q.status === 'approved').length
    const rejected = quotes.filter(q => q.status === 'rejected').length
    const completed = quotes.filter(q => q.status === 'completed').length

    setStats({ total: quotes.length, totalValue, pending, approved, rejected, completed })
  }, [quotes])

  const fetchQuotes = async () => {
    setQuotesLoading(true)
    try {
      const response = await fetch('/api/admin/trade-quotes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data.success) {
        setQuotes(data.quotes || [])
      } else {
        console.error('Failed to fetch trade quotes:', data.error)
      }
    } catch (error) {
      console.error('Error fetching trade quotes:', error)
    }
    setQuotesLoading(false)
  }

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      const response = await fetch('/api/admin/trade-quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, status: newStatus })
      })
      const data = await response.json()
      if (data.success) {
        setQuotes(prev => prev.map(q =>
          q.id === quoteId ? { ...q, status: newStatus, updated_at: new Date().toISOString() } : q
        ))
      } else {
        console.error('Failed to update quote:', data.error)
      }
    } catch (error) {
      console.error('Error updating quote:', error)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user || loading) return null

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subheading')}</p>
          </div>
          <Button onClick={fetchQuotes} disabled={quotesLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${quotesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalQuotes')}</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalValue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('allStatus')}</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quotesList')} ({filteredQuotes.length})</CardTitle>
            <CardDescription>
              {quotesLoading ? t('loading') : t('showingOf', { count: filteredQuotes.length, total: quotes.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quotesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div>{t('loading')}</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product')}</TableHead>
                      <TableHead>{t('customer')}</TableHead>
                      <TableHead>{t('estimatedValue')}</TableHead>
                      <TableHead>Shipping</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('created')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {quote.product_title}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">{quote.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{quote.customer_email}</div>
                            {quote.customer_phone && (
                              <div className="text-xs text-muted-foreground">{quote.customer_phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${Number(quote.estimated_value).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <ShippingMethodBadge method={quote.shipping_method} />
                        </TableCell>
                        <TableCell>
                          <select
                            value={quote.status || 'pending'}
                            onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(quote.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{new Date(quote.created_at).toLocaleTimeString()}</div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedQuote(quote); setShowDetails(true) }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredQuotes.length === 0 && !quotesLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('noResults')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {showDetails && selectedQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{t('details')}</CardTitle>
                  <CardDescription>{selectedQuote.product_title}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{t('customerInfo')}</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedQuote.customer_name}</p>
                    <p><strong>Email:</strong> {selectedQuote.customer_email}</p>
                    {selectedQuote.customer_phone && <p><strong>Phone:</strong> {selectedQuote.customer_phone}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">{t('quoteInfo')}</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>{t('product')}:</strong> {selectedQuote.product_title}</p>
                    <p><strong>{t('estimatedValue')}:</strong> ${Number(selectedQuote.estimated_value).toFixed(2)}</p>
                    {selectedQuote.base_price && <p><strong>{t('basePrice')}</strong> ${Number(selectedQuote.base_price).toFixed(2)}</p>}
                    {selectedQuote.total_deduction > 0 && <p className="text-red-500"><strong>{t('deductions')}</strong> -${Number(selectedQuote.total_deduction).toFixed(2)}</p>}
                    {selectedQuote.total_bonus > 0 && <p className="text-green-600"><strong>{t('bonuses')}</strong> +${Number(selectedQuote.total_bonus).toFixed(2)}</p>}
                    <p>
                      <strong>{t('status')}:</strong>{' '}
                      <Badge className={getStatusBadgeColor(selectedQuote.status)}>
                        {selectedQuote.status}
                      </Badge>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <strong>Shipping:</strong>{' '}
                      <ShippingMethodBadge method={selectedQuote.shipping_method} />
                    </p>
                  </div>
                </div>

                <ConditionDisplay quote={selectedQuote} />

                {selectedQuote.depreciation && (
                  <div>
                    <h4 className="font-semibold mb-1">{t('depreciation')}</h4>
                    <div className="text-sm bg-accent p-3 rounded space-y-1">
                      {typeof selectedQuote.depreciation === 'object' ? (
                        Object.entries(selectedQuote.depreciation).map(([key, val]) => (
                          <p key={key}><span className="text-muted-foreground">{key}:</span> {typeof val === 'number' ? `${val}%` : String(val)}</p>
                        ))
                      ) : (
                        <p>{String(selectedQuote.depreciation)}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedQuote.notes && (
                  <div>
                    <h4 className="font-semibold mb-1">{t('notes')}</h4>
                    <p className="text-sm bg-accent p-3 rounded">{selectedQuote.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-1">{t('timestamps')}</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Created:</strong> {new Date(selectedQuote.created_at).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(selectedQuote.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
