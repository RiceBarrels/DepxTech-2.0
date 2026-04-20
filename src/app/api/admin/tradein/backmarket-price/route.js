import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BACKMARKET_BASE = 'https://www.backmarket.com/en-us'

// ScraperAPI proxy for Cloudflare bypass
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY
const SCRAPER_API_URL = 'https://api.scraperapi.com'


/**
 * Fetch a URL through ScraperAPI to bypass Cloudflare bot protection.
 */
async function fetchWithProxy(targetUrl) {
  if (!SCRAPER_API_KEY) {
    throw new Error('SCRAPER_API_KEY is not configured')
  }

  const proxyUrl = new URL(SCRAPER_API_URL)
  proxyUrl.searchParams.set('api_key', SCRAPER_API_KEY)
  proxyUrl.searchParams.set('url', targetUrl)

  return fetch(proxyUrl.toString(), {
    signal: AbortSignal.timeout(90000),
  })
}

// ─── Nuxt Data Hydration ─────────────────────────────────────────────────────

/**
 * Hydrate Nuxt 3's serialized __NUXT_DATA__ payload.
 * The payload is a flat JSON array where objects/arrays reference other
 * indices, and reactive wrappers like ["ShallowReactive", idx] are unwrapped.
 */
function hydrateNuxtData(data, index, seen = new Map()) {
  if (index >= data.length || index < 0) return undefined
  if (seen.has(index)) return seen.get(index)

  const value = data[index]

  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value

  // Nuxt reactive wrappers
  if (Array.isArray(value)) {
    if (
      value.length === 2 &&
      typeof value[0] === 'string' &&
      (value[0] === 'ShallowReactive' || value[0] === 'Reactive') &&
      typeof value[1] === 'number'
    ) {
      return hydrateNuxtData(data, value[1], seen)
    }
    if (value[0] === 'Set') return new Set()

    const arr = []
    seen.set(index, arr)
    for (const item of value) {
      if (typeof item === 'number' && Number.isInteger(item) && item >= 0 && item < data.length) {
        arr.push(hydrateNuxtData(data, item, seen))
      } else {
        arr.push(item)
      }
    }
    return arr
  }

  // Plain object — values are indices into the data array
  const obj = {}
  seen.set(index, obj)
  for (const [key, idx] of Object.entries(value)) {
    if (typeof idx === 'number' && Number.isInteger(idx) && idx >= 0 && idx < data.length) {
      obj[key] = hydrateNuxtData(data, idx, seen)
    } else {
      obj[key] = idx
    }
  }
  return obj
}

// ─── Product Extraction ──────────────────────────────────────────────────────

/**
 * Extract products from Back Market search HTML.
 * Primary: parses the __NUXT_DATA__ payload which contains the full Algolia
 * search response with rich product data.
 */
function extractProducts(html) {
  // Strategy 1: __NUXT_DATA__ (contains Algolia search response)
  const nuxtResult = extractFromNuxtData(html)
  if (nuxtResult.products.length > 0) return nuxtResult

  // Strategy 2: JSON-LD structured data
  const jsonLdProducts = extractFromJsonLd(html)
  if (jsonLdProducts.length > 0) return { products: jsonLdProducts, nbHits: jsonLdProducts.length, nbPages: 1 }

  // Strategy 3: HTML pattern matching (fallback)
  const htmlProducts = extractFromHtml(html)
  return { products: htmlProducts, nbHits: htmlProducts.length, nbPages: 1 }
}

function extractFromNuxtData(html) {
  const empty = { products: [], nbHits: 0, nbPages: 0 }

  const nuxtDataMatch = html.match(
    /id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  )
  if (!nuxtDataMatch) return empty

  try {
    const data = JSON.parse(nuxtDataMatch[1])
    const root = hydrateNuxtData(data, 0)

    if (!root?.data) return empty

    // Find the algolia-search key (hash suffix varies)
    const searchKey = Object.keys(root.data).find((k) =>
      k.startsWith('algolia-search:')
    )
    if (!searchKey) return empty

    const searchData = root.data[searchKey]
    const hits = searchData?.hits || []

    const products = hits.map((hit) => ({
      title: hit.title || '',
      price: hit.price ?? null,
      price_new: hit.price_new ?? null,
      currency: hit.currency || 'USD',
      url: hit.link_grade_v2?.href || hit.link_master_pp?.href || null,
      master_url: hit.link_master_pp?.href || null,
      slug: hit.link_master_pp?.params?.slug || null,
      image: hit.image1 || null,
      brand: hit.brand_clean || hit.brand || null,
      model: hit.model_clean || hit.model || null,
      category: hit.category_3 || null,
      condition: hit.backbox_grade_label || null,
      condition_score: hit.backbox_grade_value ?? null,
      color: hit.color || null,
      storage: hit.sub_title_elements?.[0] || null,
      rating: hit.reviewRating?.average ?? null,
      review_count: hit.reviewRating?.count ?? null,
      warranty_months: hit.warranty ?? null,
      stock: hit.stockRaw ?? null,
      reference_price: hit.referencePrice?.amount
        ? parseFloat(hit.referencePrice.amount)
        : null,
      savings_pct: hit.price && hit.price_new
        ? Math.round((1 - hit.price / hit.price_new) * 100)
        : null,
      objectID: hit.objectID || null,
    }))

    return {
      products,
      nbHits: searchData.nbHits || products.length,
      nbPages: searchData.nbPages || 1,
    }
  } catch {
    return empty
  }
}

function extractFromJsonLd(html) {
  const products = []
  const jsonLdRegex =
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      const items =
        data['@type'] === 'ItemList'
          ? data.itemListElement || []
          : Array.isArray(data)
            ? data
            : [data]

      for (const item of items) {
        const product = item.item || item
        if (product['@type'] !== 'Product') continue

        const offer = Array.isArray(product.offers)
          ? product.offers[0]
          : product.offers

        products.push({
          title: product.name || '',
          price: parseFloat(offer?.price) || null,
          price_new: null,
          currency: offer?.priceCurrency || 'USD',
          url: product.url || offer?.url || null,
          master_url: null,
          slug: null,
          image: Array.isArray(product.image) ? product.image[0] : product.image || null,
          brand: null,
          model: null,
          category: null,
          condition: offer?.itemCondition || null,
          condition_score: null,
          color: null,
          storage: null,
          rating: product.aggregateRating?.ratingValue || null,
          review_count: product.aggregateRating?.reviewCount || null,
          warranty_months: null,
          stock: null,
          reference_price: null,
          savings_pct: null,
          objectID: null,
        })
      }
    } catch {
      // Skip
    }
  }
  return products
}

function extractFromHtml(html) {
  const products = []
  const blocks = html.match(/<a[^>]*href="(\/en-us\/p\/[^"]*)"[^>]*>[\s\S]*?<\/a>/gi) || []

  for (const block of blocks) {
    const urlMatch = block.match(/href="(\/en-us\/p\/[^"]*)"/)
    const url = urlMatch ? `https://www.backmarket.com${urlMatch[1]}` : null

    const titleMatch =
      block.match(/aria-label="([^"]*)"/) ||
      block.match(/title="([^"]*)"/) ||
      block.match(/<h[23][^>]*>([^<]+)<\/h[23]>/)
    const title = titleMatch?.[1]?.trim() || ''

    const priceMatch = block.match(/\$\s*([\d,]+(?:\.\d{2})?)/)
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null

    if (title || price) {
      products.push({
        title, price, price_new: null, currency: 'USD', url,
        master_url: null, slug: null, image: null, brand: null,
        model: null, category: null, condition: null, condition_score: null,
        color: null, storage: null, rating: null, review_count: null,
        warranty_months: null, stock: null, reference_price: null,
        savings_pct: null, objectID: null,
      })
    }
  }

  const seen = new Set()
  return products.filter((p) => {
    if (!p.url || seen.has(p.url)) return false
    seen.add(p.url)
    return true
  })
}

// ─── API Route ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/tradein/backmarket-price?q=<query>&page=1
 *
 * Scrapes Back Market search results via ScraperAPI proxy.
 * Returns structured product data with pricing stats.
 */
export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = searchParams.get('page') || '1'

    if (!query) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      )
    }

    if (!SCRAPER_API_KEY) {
      return NextResponse.json(
        {
          error: 'SCRAPER_API_KEY is not configured',
          setup: 'Add SCRAPER_API_KEY to .env.local (https://www.scraperapi.com/)',
        },
        { status: 503 }
      )
    }

    const bmUrl = new URL(`${BACKMARKET_BASE}/search`)
    bmUrl.searchParams.set('q', query)
    if (page !== '1') {
      bmUrl.searchParams.set('page', page)
    }

    const res = await fetchWithProxy(bmUrl.toString())

    if (!res.ok) {
      return NextResponse.json(
        { error: `Scraper returned ${res.status}` },
        { status: 502 }
      )
    }

    const html = await res.text()

    // Check for Cloudflare challenge page
    if (html.includes('Just a moment') && html.length < 20000) {
      return NextResponse.json(
        { error: 'Cloudflare challenge not bypassed. Try again or check ScraperAPI credits.' },
        { status: 502 }
      )
    }

    const { products, nbHits, nbPages } = extractProducts(html)

    // Compute price stats (phones only — filter out accessories under $50)
    const prices = products
      .map((p) => p.price)
      .filter((p) => typeof p === 'number' && p > 50)
      .sort((a, b) => a - b)

    let stats = null
    if (prices.length > 0) {
      const mid = Math.floor(prices.length / 2)
      const median =
        prices.length % 2 === 0
          ? (prices[mid - 1] + prices[mid]) / 2
          : prices[mid]

      stats = {
        median: Math.round(median * 100) / 100,
        min: prices[0],
        max: prices[prices.length - 1],
        count: prices.length,
      }
    }

    return NextResponse.json({
      success: true,
      query,
      page: parseInt(page),
      total_hits: nbHits,
      total_pages: nbPages,
      results_on_page: products.length,
      stats,
      products,
    })
  } catch (error) {
    console.error('Back Market scrape error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape Back Market', details: error.message },
      { status: 500 }
    )
  }
}

// ─── Helpers for POST (bulk price fetch) ─────────────────────────────────────

/**
 * Search Back Market for a product and return the lowest price for matching items.
 * Strips parenthetical info from the title for cleaner searches.
 */
async function fetchBackmarketPrice(title) {
  const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim()

  const bmUrl = new URL(`${BACKMARKET_BASE}/search`)
  bmUrl.searchParams.set('q', cleanTitle)

  const res = await fetchWithProxy(bmUrl.toString())
  if (!res.ok) throw new Error(`Scraper returned ${res.status}`)

  const html = await res.text()

  if (html.includes('Just a moment') && html.length < 20000) {
    throw new Error('Cloudflare challenge not bypassed')
  }

  const { products } = extractProducts(html)

  // Filter to products > $50 (exclude accessories) and matching title keywords
  const keywords = cleanTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const matching = products.filter((p) => {
    if (typeof p.price !== 'number' || p.price <= 50) return false
    const ptitle = (p.title || '').toLowerCase()
    return keywords.every((kw) => ptitle.includes(kw))
  })

  if (matching.length === 0) return null

  // Return the lowest price (best deal on Back Market)
  matching.sort((a, b) => a.price - b.price)
  return matching[0].price
}

function applyCommission(price, tiers) {
  const appliedTier = tiers.find(t => price <= t.maxPrice)
    || tiers[tiers.length - 1]

  const commission = price * appliedTier.percentage + appliedTier.fixedFee
  const net = price - commission
  return Math.round(Math.max(0, net) * 100) / 100
}

/**
 * POST /api/admin/tradein/backmarket-price
 *
 * Accepts { ids: [...] } of tradable_product IDs.
 * Fetches Back Market prices, applies backmarket_tiers commission,
 * and updates base_price in DB.
 * Streams NDJSON results (same format as ebay-price route).
 */
export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    if (!SCRAPER_API_KEY) {
      return NextResponse.json(
        { error: 'SCRAPER_API_KEY is not configured' },
        { status: 503 }
      )
    }

    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    const supabase = supabaseAdmin

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
      .select('brand, category, backmarket_tiers')

    const tierConfigs = allTiers || []

    function getTiersForProduct(brand, category) {
      const exact = tierConfigs.find(r => r.brand === brand && r.category === category)
      if (exact?.backmarket_tiers?.length) return exact.backmarket_tiers

      const brandOnly = tierConfigs.find(r => r.brand === brand && !r.category)
      if (brandOnly?.backmarket_tiers?.length) return brandOnly.backmarket_tiers

      const categoryOnly = tierConfigs.find(r => !r.brand && r.category === category)
      if (categoryOnly?.backmarket_tiers?.length) return categoryOnly.backmarket_tiers

      const global = tierConfigs.find(r => !r.brand && !r.category)
      if (global?.backmarket_tiers?.length) return global.backmarket_tiers

      return null
    }

    const today = new Date().toISOString().split('T')[0]
    const encoder = new TextEncoder()

    // Process one at a time — each request goes through ScraperAPI
    const stream = new ReadableStream({
      async start(controller) {
        let updated = 0
        let failed = 0

        for (const product of products) {
          try {
            const rawPrice = await fetchBackmarketPrice(product.title)

            if (rawPrice === null) {
              failed++
              controller.enqueue(encoder.encode(JSON.stringify({
                id: product.id, title: product.title, bm_price: null,
                success: false, reason: 'No matching listings found'
              }) + '\n'))
              continue
            }

            const tiers = getTiersForProduct(product.brand, product.category)
            const bmPrice = tiers ? applyCommission(rawPrice, tiers) : rawPrice

            const { error: updateError } = await supabase
              .from('tradable_products')
              .update({ base_price: bmPrice, base_date: today })
              .eq('id', product.id)

            if (updateError) {
              failed++
              controller.enqueue(encoder.encode(JSON.stringify({
                id: product.id, title: product.title, bm_price: bmPrice,
                success: false, reason: 'DB update failed'
              }) + '\n'))
            } else {
              updated++
              controller.enqueue(encoder.encode(JSON.stringify({
                id: product.id, title: product.title, bm_price: bmPrice, success: true
              }) + '\n'))
            }
          } catch (err) {
            failed++
            controller.enqueue(encoder.encode(JSON.stringify({
              id: product.id, title: product.title, bm_price: null,
              success: false, reason: err.message
            }) + '\n'))
          }
        }

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
    console.error('Back Market bulk price error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
