import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@supabase/supabase-js'

const COMMISSION_TIERS = [
  { maxPrice: 100, percentage: 0.31, fixedFee: 7 },
  { maxPrice: 200, percentage: 0.295, fixedFee: 9 },
  { maxPrice: 300, percentage: 0.28, fixedFee: 11 },
  { maxPrice: 400, percentage: 0.265, fixedFee: 13 },
  { maxPrice: 500, percentage: 0.25, fixedFee: 15 },
  { maxPrice: 600, percentage: 0.24, fixedFee: 17 },
  { maxPrice: 700, percentage: 0.23, fixedFee: 19 },
  { maxPrice: 800, percentage: 0.22, fixedFee: 21 },
  { maxPrice: 900, percentage: 0.21, fixedFee: 23 },
  { maxPrice: 1000, percentage: 0.20, fixedFee: 25 },
]

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function fetchMedianEbayPrice(query) {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) throw new Error('SERPAPI_KEY is not configured')

  const searchQuery = `${query} used`

  const params = new URLSearchParams({
    engine: 'ebay',
    _nkw: searchQuery,
    buying_format: 'BIN',
    api_key: apiKey,
    _ipg: '50',
  })

  const res = await fetch(`https://serpapi.com/search.json?${params}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SerpAPI error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const results = data.organic_results || []

  const queryLower = query.toLowerCase()
  const prices = []
  for (const item of results) {
    // Skip results whose title doesn't contain the query
    if (!item.title?.toLowerCase().includes(queryLower)) continue
    if (!item.price) continue
    // price can be { extracted: number } or { from: { extracted }, to: { extracted } }
    const extracted = item.price.extracted ?? item.price.from?.extracted
    if (typeof extracted === 'number' && extracted > 0) {
      prices.push(extracted)
    }
  }

  if (prices.length === 0) return null

  // Calculate median
  prices.sort((a, b) => a - b)
  const mid = Math.floor(prices.length / 2)
  const median = prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid]

  // Apply commission tier based on median price
  return applyCommission(median)
}

function applyCommission(median) {
  // Find the first tier where median fits under maxPrice, fallback to last tier
  const appliedTier = COMMISSION_TIERS.find(t => median <= t.maxPrice)
    || COMMISSION_TIERS[COMMISSION_TIERS.length - 1]

  const commission = median * appliedTier.percentage + appliedTier.fixedFee
  const net = median - commission
  return Math.round(Math.max(0, net) * 100) / 100
}

export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Fetch all selected products
    const { data: products, error: fetchError } = await supabase
      .from('tradable_products')
      .select('id, title')
      .in('id', ids)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const today = new Date().toISOString().split('T')[0]
    const encoder = new TextEncoder()

    // Stream results as NDJSON — each product result sent immediately when done
    const stream = new ReadableStream({
      async start(controller) {
        let updated = 0
        let failed = 0

        for (const product of products) {
          let result
          try {
            const ebayPrice = await fetchMedianEbayPrice(product.title)

            if (ebayPrice === null) {
              result = { id: product.id, title: product.title, ebay_price: null, success: false, reason: 'No listings found' }
              failed++
            } else {
              const { error: updateError } = await supabase
                .from('tradable_products')
                .update({ base_price: ebayPrice, base_date: today })
                .eq('id', product.id)

              if (updateError) {
                result = { id: product.id, title: product.title, ebay_price: ebayPrice, success: false, reason: 'DB update failed' }
                failed++
              } else {
                result = { id: product.id, title: product.title, ebay_price: ebayPrice, success: true }
                updated++
              }
            }
          } catch (err) {
            result = { id: product.id, title: product.title, ebay_price: null, success: false, reason: err.message }
            failed++
          }

          // Send this result immediately
          controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'))
        }

        // Send final summary line
        controller.enqueue(encoder.encode(JSON.stringify({ done: true, updated, failed }) + '\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error in ebay-price route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
