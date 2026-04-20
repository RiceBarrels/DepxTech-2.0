import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)

    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    // Use count-only queries where possible to avoid fetching all rows
    const [productsResult, ordersCountResult, pendingCountResult, revenueResult, recentOrdersResult, tradeinResult, offersResult] = await Promise.all([
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true }).eq('order_status', 'pending'),
      supabaseAdmin.from('transactions').select('amount'),
      supabaseAdmin.from('transactions').select('id, amount, status, order_status, billing_details, created_at, payment_intent_id').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('tradable_products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('offers').select('id, is_active, start_date, end_date'),
    ])

    const totalProducts = productsResult.count ?? 0
    const totalOrders = ordersCountResult.count ?? 0
    const pendingOrders = pendingCountResult.count ?? 0
    const totalTradeins = tradeinResult.count ?? 0
    const totalRevenue = (revenueResult.data || []).reduce((sum, t) => sum + (t.amount || 0), 0)
    const recentOrders = recentOrdersResult.data || []

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
