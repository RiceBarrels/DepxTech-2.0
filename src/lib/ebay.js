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
}

// Export singleton instance
export const ebayClient = new EbayClient()

// Also export class for testing
export { EbayClient }
