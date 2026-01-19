/**
 * eBay API Client for fetching public store listings
 * Uses Browse API with Client Credentials (no user token needed)
 */

const EBAY_SANDBOX_API = 'https://api.sandbox.ebay.com'
const EBAY_PRODUCTION_API = 'https://api.ebay.com'

class EbayClient {
  constructor() {
    this.appId = process.env.EBAY_APP_ID
    this.certId = process.env.EBAY_CERT_ID
    this.isSandbox = process.env.EBAY_SANDBOX === 'true'
    this.baseUrl = this.isSandbox ? EBAY_SANDBOX_API : EBAY_PRODUCTION_API
    this.accessToken = null
    this.tokenExpiry = null
    this.sellerUsername = process.env.EBAY_SELLER_USERNAME || 'depxtech'
  }

  /**
   * Get OAuth token using Client Credentials Grant
   * This doesn't require user authorization - just app credentials
   */
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.accessToken
    }

    const credentials = Buffer.from(`${this.appId}:${this.certId}`).toString('base64')

    const response = await fetch(`${this.baseUrl}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get eBay access token (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 min early

    return this.accessToken
  }

  /**
   * Search for items from a specific seller using Browse API
   * @param {string} sellerUsername - eBay seller username
   * @param {number} limit - Max items per page
   * @param {number} offset - Pagination offset
   */
  async getSellerItems(sellerUsername = null, limit = 200, offset = 0) {
    const token = await this.getAccessToken()
    const seller = sellerUsername || this.sellerUsername

    // Use Browse API to search by seller
    const params = new URLSearchParams({
      q: `seller:${seller}`,
      limit: limit.toString(),
      offset: offset.toString(),
    })

    const response = await fetch(
      `${this.baseUrl}/buy/browse/v1/item_summary/search?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`eBay Browse API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  }

  /**
   * Get detailed item info by item ID
   * @param {string} itemId - eBay item ID
   */
  async getItemDetails(itemId) {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.baseUrl}/buy/browse/v1/item/${itemId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`eBay Item API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  }

  /**
   * Fetch ALL items from seller (handles pagination)
   */
  async getAllSellerItems(sellerUsername = null) {
    const allItems = []
    let offset = 0
    const limit = 200
    let hasMore = true

    while (hasMore) {
      const response = await this.getSellerItems(sellerUsername, limit, offset)

      if (response.itemSummaries && response.itemSummaries.length > 0) {
        allItems.push(...response.itemSummaries)
        offset += limit
        hasMore = response.itemSummaries.length === limit && offset < (response.total || 10000)
      } else {
        hasMore = false
      }
    }

    return allItems
  }

  /**
   * Convert eBay item summary to local product format
   * @param {object} ebayItem - eBay item summary from Browse API
   */
  convertToLocalProduct(ebayItem) {
    return {
      title: ebayItem.title || 'Untitled',
      des: ebayItem.shortDescription || ebayItem.title || '',
      price: ebayItem.price?.value ? parseFloat(ebayItem.price.value) : 0,
      stocks: 1, // Browse API doesn't show exact quantity, default to 1 if listed
      imgs: ebayItem.image?.imageUrl ? [ebayItem.image.imageUrl] : [],
      category: ebayItem.categories?.map(c => c.categoryName) || [],
      ebay_item_id: ebayItem.itemId,
      ebay_url: ebayItem.itemWebUrl,
      condition: ebayItem.condition || 'New',
      variant_data: [],
    }
  }

  /**
   * Convert detailed eBay item to local product format (more data)
   * @param {object} ebayItem - eBay item details from Browse API
   */
  convertDetailedToLocalProduct(ebayItem) {
    // Get all images
    const images = []
    if (ebayItem.image?.imageUrl) {
      images.push(ebayItem.image.imageUrl)
    }
    if (ebayItem.additionalImages) {
      images.push(...ebayItem.additionalImages.map(img => img.imageUrl))
    }

    return {
      title: ebayItem.title || 'Untitled',
      des: ebayItem.description || ebayItem.shortDescription || '',
      price: ebayItem.price?.value ? parseFloat(ebayItem.price.value) : 0,
      stocks: ebayItem.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity || 1,
      imgs: images,
      category: ebayItem.categoryPath?.split('|') || [],
      ebay_item_id: ebayItem.itemId,
      ebay_url: ebayItem.itemWebUrl,
      condition: ebayItem.condition || 'New',
      variant_data: [],
    }
  }

  /**
   * Search for items by keyword and calculate average price
   * @param {string} query - Search query (product name)
   * @param {object} options - Search options
   * @returns {object} Price statistics
   */
  async searchProductPrices(query, options = {}) {
    const token = await this.getAccessToken()

    const {
      limit = 50,
      condition = null, // 'NEW', 'USED', or null for all
      category = null,
    } = options

    // Build filter string
    let filter = ''
    if (condition) {
      filter = `conditionIds:{${condition === 'NEW' ? '1000' : '3000|4000|5000|6000'}}`
    }

    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      sort: 'price',
    })

    if (filter) {
      params.append('filter', filter)
    }

    if (category) {
      params.append('category_ids', category)
    }

    const response = await fetch(
      `${this.baseUrl}/buy/browse/v1/item_summary/search?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`eBay Search API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      return {
        found: false,
        query,
        message: 'No listings found for this product',
        count: 0,
        prices: null
      }
    }

    // Extract prices (filter out auctions without buy-it-now and items without prices)
    const prices = data.itemSummaries
      .filter(item => item.price?.value && parseFloat(item.price.value) > 0)
      .map(item => ({
        price: parseFloat(item.price.value),
        title: item.title,
        condition: item.condition,
        itemId: item.itemId,
        url: item.itemWebUrl
      }))

    if (prices.length === 0) {
      return {
        found: false,
        query,
        message: 'No items with valid prices found',
        count: 0,
        prices: null
      }
    }

    // Calculate statistics
    const priceValues = prices.map(p => p.price)
    const sum = priceValues.reduce((a, b) => a + b, 0)
    const avg = sum / priceValues.length
    const sorted = [...priceValues].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    // Calculate trade-in value (typically 40-60% of market price)
    const tradeInMultiplier = 0.50 // 50% of average market price
    const suggestedTradeIn = avg * tradeInMultiplier

    return {
      found: true,
      query,
      count: prices.length,
      totalResults: data.total || prices.length,
      prices: {
        average: Math.round(avg * 100) / 100,
        median: Math.round(median * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        suggestedTradeIn: Math.round(suggestedTradeIn * 100) / 100,
      },
      samples: prices.slice(0, 5), // Return first 5 samples for reference
      fetchedAt: new Date().toISOString()
    }
  }

  /**
   * Search with condition filtering and return price for trade-in
   * @param {string} productName - Product name to search
   * @returns {object} Trade-in price suggestion based on eBay market data
   */
  async getTradeInPrice(productName) {
    try {
      // Search for used items (more relevant for trade-in)
      const usedResults = await this.searchProductPrices(productName, {
        condition: 'USED',
        limit: 30
      })

      // Also search for new items to get reference
      const newResults = await this.searchProductPrices(productName, {
        condition: 'NEW',
        limit: 20
      })

      // Combine data for comprehensive pricing
      const result = {
        productName,
        usedMarket: usedResults.found ? usedResults.prices : null,
        newMarket: newResults.found ? newResults.prices : null,
        fetchedAt: new Date().toISOString()
      }

      // Calculate suggested trade-in value
      if (usedResults.found) {
        // Use used market median as base, trade-in is typically 60-70% of used market
        result.suggestedTradeIn = Math.round(usedResults.prices.median * 0.65 * 100) / 100
        result.tradeInRange = {
          low: Math.round(usedResults.prices.median * 0.50 * 100) / 100,
          high: Math.round(usedResults.prices.median * 0.75 * 100) / 100
        }
      } else if (newResults.found) {
        // Fallback to new price if no used listings
        result.suggestedTradeIn = Math.round(newResults.prices.median * 0.40 * 100) / 100
        result.tradeInRange = {
          low: Math.round(newResults.prices.median * 0.30 * 100) / 100,
          high: Math.round(newResults.prices.median * 0.50 * 100) / 100
        }
      } else {
        result.suggestedTradeIn = null
        result.tradeInRange = null
        result.message = 'No market data found for this product'
      }

      return result
    } catch (error) {
      throw new Error(`Failed to get trade-in price: ${error.message}`)
    }
  }
}

// Export singleton instance
export const ebayClient = new EbayClient()

// Also export class for testing
export { EbayClient }
