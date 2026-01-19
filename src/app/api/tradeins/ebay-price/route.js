import { NextResponse } from 'next/server'
import { ebayClient } from '@/lib/ebay'
import { createClient } from '@supabase/supabase-js'

// Cache for eBay price lookups (in-memory, will reset on server restart)
const priceCache = new Map()
const settingsCache = { data: null, timestamp: 0 }
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes
const SETTINGS_CACHE_DURATION = 1000 * 60 * 5 // 5 minutes for settings

// Create Supabase client for fetching settings
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Fetch settings from database with caching
async function getTradeSettings() {
  // Check cache first
  if (settingsCache.data && Date.now() - settingsCache.timestamp < SETTINGS_CACHE_DURATION) {
    return settingsCache.data
  }

  const supabase = createServiceRoleClient()
  if (!supabase) {
    // Return defaults if no database connection
    return {
      used_market_multiplier: 65,
      new_market_multiplier: 40,
      trade_in_range_low: 50,
      trade_in_range_high: 75
    }
  }

  try {
    const { data, error } = await supabase
      .from('trade_settings')
      .select('setting_key, setting_value')

    if (error) {
      console.error('Error fetching trade settings:', error)
      return {
        used_market_multiplier: 65,
        new_market_multiplier: 40,
        trade_in_range_low: 50,
        trade_in_range_high: 75
      }
    }

    // Convert array to object
    const settings = {}
    data.forEach(s => {
      settings[s.setting_key] = parseFloat(s.setting_value)
    })

    // Cache the result
    settingsCache.data = settings
    settingsCache.timestamp = Date.now()

    return settings
  } catch (err) {
    console.error('Error fetching trade settings:', err)
    return {
      used_market_multiplier: 65,
      new_market_multiplier: 40,
      trade_in_range_low: 50,
      trade_in_range_high: 75
    }
  }
}

// Apply settings to price data
function applySettings(priceData, settings) {
  const usedMultiplier = (settings.used_market_multiplier || 65) / 100
  const newMultiplier = (settings.new_market_multiplier || 40) / 100
  const rangeLow = (settings.trade_in_range_low || 50) / 100
  const rangeHigh = (settings.trade_in_range_high || 75) / 100

  if (priceData.usedMarket && priceData.usedMarket.median) {
    const median = priceData.usedMarket.median
    priceData.suggestedTradeIn = Math.round(median * usedMultiplier * 100) / 100
    priceData.tradeInRange = {
      low: Math.round(median * rangeLow * 100) / 100,
      high: Math.round(median * rangeHigh * 100) / 100
    }
  } else if (priceData.newMarket && priceData.newMarket.median) {
    const median = priceData.newMarket.median
    priceData.suggestedTradeIn = Math.round(median * newMultiplier * 100) / 100
    priceData.tradeInRange = {
      low: Math.round(median * (newMultiplier * 0.75) * 100) / 100,
      high: Math.round(median * (newMultiplier * 1.25) * 100) / 100
    }
  }

  priceData.appliedSettings = {
    usedMultiplier: settings.used_market_multiplier,
    newMultiplier: settings.new_market_multiplier,
    rangeLow: settings.trade_in_range_low,
    rangeHigh: settings.trade_in_range_high
  }

  return priceData
}

/**
 * GET /api/tradeins/ebay-price?query=iPhone 15 Pro Max 256GB
 * Fetches average price from eBay for a product
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const productId = searchParams.get('productId')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim()
    const cached = priceCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        cached: true,
        ...cached.data
      })
    }

    // Fetch from eBay
    let priceData = await ebayClient.getTradeInPrice(query)

    // Get settings and apply them
    const settings = await getTradeSettings()
    priceData = applySettings(priceData, settings)

    // Check if we got any data
    if (!priceData.suggestedTradeIn) {
      const isSandbox = process.env.EBAY_SANDBOX === 'true'
      return NextResponse.json({
        success: false,
        error: 'No market data found',
        details: isSandbox
          ? 'eBay Sandbox mode has limited/no real listings. Set EBAY_SANDBOX=false for production data.'
          : 'No eBay listings found for this product. Try a more specific or different search term.',
        sandbox: isSandbox,
        query,
        productId: productId || null
      })
    }

    // Cache the result
    priceCache.set(cacheKey, {
      timestamp: Date.now(),
      data: priceData
    })

    return NextResponse.json({
      success: true,
      cached: false,
      productId: productId || null,
      ...priceData
    })

  } catch (error) {
    console.error('Error fetching eBay price:', error)

    // Check if it's an API credentials issue
    if (error.message.includes('access token')) {
      return NextResponse.json(
        {
          error: 'eBay API not configured',
          details: 'Please configure EBAY_APP_ID and EBAY_CERT_ID environment variables'
        },
        { status: 503 }
      )
    }

    // Check for sandbox-specific issues
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'eBay API authentication failed',
          details: process.env.EBAY_SANDBOX === 'true'
            ? 'Sandbox mode is enabled. Sandbox has limited data - set EBAY_SANDBOX=false for production.'
            : 'Check your EBAY_APP_ID and EBAY_CERT_ID credentials'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch eBay price',
        details: error.message,
        sandbox: process.env.EBAY_SANDBOX === 'true'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tradeins/ebay-price
 * Bulk fetch prices for multiple products
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      )
    }

    if (products.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 products per request' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      products.map(async (product) => {
        const query = product.title || product.query
        if (!query) {
          return { productId: product.id, error: 'No query provided' }
        }

        try {
          // Check cache
          const cacheKey = query.toLowerCase().trim()
          const cached = priceCache.get(cacheKey)
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return {
              productId: product.id,
              cached: true,
              ...cached.data
            }
          }

          // Fetch from eBay
          const priceData = await ebayClient.getTradeInPrice(query)

          // Cache the result
          priceCache.set(cacheKey, {
            timestamp: Date.now(),
            data: priceData
          })

          return {
            productId: product.id,
            cached: false,
            ...priceData
          }
        } catch (err) {
          return {
            productId: product.id,
            error: err.message
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Error in bulk eBay price fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
