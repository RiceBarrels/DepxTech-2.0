import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@supabase/supabase-js'

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const supabase = createServiceRoleClient()

    const [productsResult, transactionsResult, tradeinResult, offersResult] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('id, amount, status, order_status, billing_details, created_at, payment_intent_id').order('created_at', { ascending: false }),
      supabase.from('tradable_products').select('id', { count: 'exact', head: true }),
      supabase.from('offers').select('id, is_active, start_date, end_date'),
    ])

    const totalProducts = productsResult.count ?? 0
    const totalTradeins = tradeinResult.count ?? 0

    const transactions = transactionsResult.data || []
    const totalOrders = transactions.length
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const pendingOrders = transactions.filter(t => t.order_status === 'pending').length

    const offers = offersResult.data || []
    const now = new Date()
    const activeOffers = offers.filter(o => {
      if (!o.is_active) return false
      const start = o.start_date ? new Date(o.start_date) : null
      const end = o.end_date ? new Date(o.end_date) : null
      if (start && now < start) return false
      if (end && now > end) return false
      return true
    }).length

    const recentOrders = transactions.slice(0, 5)

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalTradeins,
        activeOffers,
        totalOffers: offers.length,
        recentOrders,
      }
    })
  } catch (error) {
    console.error('Error in admin stats GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
