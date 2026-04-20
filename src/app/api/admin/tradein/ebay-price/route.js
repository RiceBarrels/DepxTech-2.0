import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const DEFAULT_TIERS = [
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

const EBAY_SCRAPER_API = process.env.EBAY_SCRAPER_API || 'https://rb-ebay-scraper-api.onrender.com'


async function fetchMedianEbayPrice(query) {
  // Strip parenthetical info like "(2019, A10)" from the title for cleaner searches
  const cleanQuery = query.replace(/\s*\([^)]*\)/g, '').trim()
  const searchQuery = `${cleanQuery} used`

  const params = new URLSearchParams({
    query: searchQuery,
    max_results: '30',
  })

  const res = await fetch(`${EBAY_SCRAPER_API}/search/lite?${params}`, {
    signal: AbortSignal.timeout(60000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Scraper API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Scraper API failed')

  const results = data.results || []
  const cleanLower = cleanQuery.toLowerCase()

  const prices = []
  for (const item of results) {
    // Skip results whose title doesn't contain the cleaned query
    if (!item.title?.toLowerCase().includes(cleanLower)) continue
    // Use numeric price from API
    if (typeof item.price_num === 'number' && item.price_num > 0) {
      prices.push(item.price_num)
    }
  }

  if (prices.length === 0) return null

  // Calculate median
  prices.sort((a, b) => a - b)
  const mid = Math.floor(prices.length / 2)
  return prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid]
}

function applyCommission(median, tiers) {
  const appliedTier = tiers.find(t => median <= t.maxPrice)
    || tiers[tiers.length - 1]

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

    const supabase = supabaseAdmin

    // Fetch all selected products with brand and category for tier matching
    const { data: products, error: fetchError } = await supabase
      .from('tradable_products')
      .select('id, title, brand, category')
      .in('id', ids)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Pre-fetch all commission tiers once
    const { data: allTiers } = await supabase
      .from('commission_tiers')
      .select('brand, category, tiers')

    const tierConfigs = allTiers || []

    function getTiersForProduct(brand, category) {
      const exact = tierConfigs.find(r => r.brand === brand && r.category === category)
      if (exact) return exact.tiers

      const brandOnly = tierConfigs.find(r => r.brand === brand && !r.category)
      if (brandOnly) return brandOnly.tiers

      const categoryOnly = tierConfigs.find(r => !r.brand && r.category === category)
      if (categoryOnly) return categoryOnly.tiers

      const global = tierConfigs.find(r => !r.brand && !r.category)
      if (global) return global.tiers

      return DEFAULT_TIERS
    }

    const today = new Date().toISOString().split('T')[0]
    const encoder = new TextEncoder()

    const CONCURRENCY = 5

    // Stream results as NDJSON — products fetched in parallel batches
    const stream = new ReadableStream({
      async start(controller) {
        let updated = 0
        let failed = 0

        // Process products in batches of CONCURRENCY
        for (let i = 0; i < products.length; i += CONCURRENCY) {
          const batch = products.slice(i, i + CONCURRENCY)

          const results = await Promise.all(batch.map(async (product) => {
            try {
              const median = await fetchMedianEbayPrice(product.title)

              if (median === null) {
                return { id: product.id, title: product.title, ebay_price: null, success: false, reason: 'No listings found' }
              }

              const tiers = getTiersForProduct(product.brand, product.category)
              const ebayPrice = applyCommission(median, tiers)

              const { error: updateError } = await supabase
                .from('tradable_products')
                .update({ base_price: ebayPrice, base_date: today })
                .eq('id', product.id)

              if (updateError) {
                return { id: product.id, title: product.title, ebay_price: ebayPrice, success: false, reason: 'DB update failed' }
              }

              return { id: product.id, title: product.title, ebay_price: ebayPrice, success: true }
            } catch (err) {
              return { id: product.id, title: product.title, ebay_price: null, success: false, reason: err.message }
            }
          }))

          for (const result of results) {
            if (result.success) updated++; else failed++
            controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'))
          }
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
