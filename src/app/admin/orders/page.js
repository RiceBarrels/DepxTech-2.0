'use client'

import { useAuth } from '@/lib/auth'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, Eye, Package, DollarSign, TrendingUp } from 'lucide-react'
import { openWindow } from '@/components/ui/windows'

// Component to display order items in a window
function OrderItemsDisplay({ items }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Parse the items if they're a JSON string
  let parsedItems = []
  
  try {
    if (typeof items === 'string') {
      parsedItems = JSON.parse(items)
    } else if (Array.isArray(items)) {
      parsedItems = items
    } else {
      parsedItems = []
    }
  } catch (error) {
    console.error('Error parsing cart items:', error)
    parsedItems = []
  }

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!parsedItems || parsedItems.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch product details for each item
        const productPromises = parsedItems.map(async (item) => {
          try {
            const response = await fetch(`/api/products?id=${item.productId}`)
            const data = await response.json()
            
            if (data && data.products && data.products.length > 0) {
              return {
                ...data.products[0],
                cartAmount: parseInt(item.amount || item.quantity || 1)
              }
            } else {
              console.warn(`Product not found for ID: ${item.productId}`)
              return {
                id: item.productId,
                title: 'Product Not Found',
                imgs: [],
                price: 0,
                cartAmount: parseInt(item.amount || item.quantity || 1),
                notFound: true
              }
            }
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error)
            return {
              id: item.productId,
              title: 'Error Loading Product',
              imgs: [],
              price: 0,
              cartAmount: parseInt(item.amount || item.quantity || 1),
              error: true
            }
          }
        })

        const productDetails = await Promise.all(productPromises)
        setProducts(productDetails)
      } catch (error) {
        console.error('Error fetching product details:', error)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [])

  if (!parsedItems || parsedItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
        <p className="text-muted-foreground">This order doesn't contain any items.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Order Items ({parsedItems.length})</h3>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
        <div className="space-y-4">
          {parsedItems.map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center space-x-4 animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-8 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <Package className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Items</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const totalQuantity = products.reduce((total, product) => total + product.cartAmount, 0)
  const totalValue = products.reduce((total, product) => total + (product.price * product.cartAmount), 0)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Order Items ({products.length})</h3>
        <p className="text-muted-foreground">Items included in this order</p>
      </div>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={product.id || index} className="p-4">
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {product.imgs && product.imgs.length > 0 && !product.notFound && !product.error ? (
                  <img 
                    src={product.imgs[0]} 
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full flex items-center justify-center ${product.imgs && product.imgs.length > 0 ? 'hidden' : 'flex'}`}
                  style={{ display: (product.imgs && product.imgs.length > 0 && !product.notFound && !product.error) ? 'none' : 'flex' }}
                >
                  <Package className={`w-8 h-8 ${product.error ? 'text-red-400' : product.notFound ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                </div>
              </div>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold truncate ${product.error ? 'text-red-600' : product.notFound ? 'text-yellow-600' : ''}`}>
                  {product.title || 'Unknown Product'}
                </h4>
                <p className="text-sm text-muted-foreground font-mono">
                  ID: {product.id}
                </p>
                {product.des && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {product.des}
                  </p>
                )}
                {!product.notFound && !product.error && (
                  <p className="text-sm font-medium text-green-600 mt-1">
                    ${product.price} each
                  </p>
                )}
              </div>
              
              {/* Quantity and Total */}
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-semibold">
                  Qty: {product.cartAmount}
                </div>
                {!product.notFound && !product.error && (
                  <div className="text-sm text-muted-foreground">
                    Total: ${(product.price * product.cartAmount).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional product info */}
            {product.category && product.category.length > 0 && !product.notFound && !product.error && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Categories:</span>
                  <div className="flex gap-1 flex-wrap">
                    {product.category.map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {/* Order Summary */}
      <div className="mt-6 pt-4 border-t space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Items:</span>
          <span className="font-semibold">{totalQuantity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Value:</span>
          <span className="font-semibold text-green-600">${totalValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const { user, loading } = useAuth()
  const router = useTransitionRouter()
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    // Filter transactions based on search term and status filters
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(transaction.billing_details || {})?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    if (orderStatusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.order_status === orderStatusFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter, orderStatusFilter])

  useEffect(() => {
    // Calculate stats
    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const pending = transactions.filter(t => t.order_status === 'pending').length
    const completed = transactions.filter(t => t.order_status === 'completed').length
    const cancelled = transactions.filter(t => t.order_status === 'cancelled').length

    setStats({
      total: transactions.length,
      totalAmount,
      pending,
      completed,
      cancelled
    })
  }, [transactions])

  const fetchTransactions = async () => {
    setTransactionsLoading(true)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions || [])
      } else {
        console.error('Failed to fetch transactions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
    setTransactionsLoading(false)
  }

  const updateTransactionStatus = async (transactionId, newStatus, newOrderStatus) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          status: newStatus,
          orderStatus: newOrderStatus
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setTransactions(prev => prev.map(t => 
          t.id === transactionId 
            ? { ...t, status: newStatus || t.status, order_status: newOrderStatus || t.order_status }
            : t
        ))
      } else {
        console.error('Failed to update transaction:', data.error)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount / 100) // Assuming amount is in cents
  }

  if (!user || loading) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-accent-foreground">Orders & Transactions</h1>
            <p className="text-muted-foreground">Manage customer orders and transaction data</p>
          </div>
          <Button onClick={fetchTransactions} disabled={transactionsLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAmount} $</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by payment ID, user ID, or email..."
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
                <option value="all">All Payment Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Order Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription>
              {transactionsLoading ? 'Loading transactions...' : `Showing ${filteredTransactions.length} of ${transactions.length} transactions`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div>Loading transactions...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Intent</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.payment_intent_id || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {transaction.billing_details?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.billing_details?.email || transaction.user_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.amount} $
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(transaction.status)}>
                            {transaction.status || 'unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <select
                            value={transaction.order_status || 'pending'}
                            onChange={(e) => updateTransactionStatus(transaction.id, null, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </TableCell>
                                                  <TableCell>
                           <Button variant="outline" size="sm" onClick={()=>{
                             openWindow('Order Items', <OrderItemsDisplay items={transaction.cart_items} />, {
                               icon: <Package className="w-4 h-4" />,
                               width: 700,
                               height: 500
                             })
                           }}>
                             <Package className="w-4 h-4" />
                           </Button>
                          </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredTransactions.length === 0 && !transactionsLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details Modal */}
        {showDetails && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="ml-auto"
                >
                  Close
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Payment Information</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Payment Intent:</strong> {selectedTransaction.payment_intent_id}</p>
                      <p><strong>Amount:</strong> {selectedTransaction.amount}</p>
                      <p><strong>Status:</strong> {selectedTransaction.status}</p>
                      <p><strong>Currency:</strong> {selectedTransaction.currency}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">Billing Details</h4>
                    <pre className="text-sm bg-accent p-3 rounded overflow-auto">
                      {JSON.stringify(selectedTransaction.billing_details, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold">Shipping Details</h4>
                    <pre className="text-sm bg-accent p-3 rounded overflow-auto">
                      {JSON.stringify(selectedTransaction.shipping_details, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold">Cart Items</h4>
                    <pre className="text-sm bg-accent p-3 rounded overflow-auto">
                      {JSON.stringify(selectedTransaction.cart_items, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold">Timestamps</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Created:</strong> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {new Date(selectedTransaction.updated_at).toLocaleString()}</p>
                    </div>
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
