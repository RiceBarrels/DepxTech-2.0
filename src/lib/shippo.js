/**
 * Shippo API Integration
 * Provides shipping rates, address validation, and label creation
 */

const SHIPPO_API_URL = 'https://api.goshippo.com'

class ShippoClient {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.SHIPPO_API_KEY
        if (!this.apiKey) {
            console.warn('Shippo API key not configured')
        }
    }

    async request(endpoint, options = {}) {
        const url = `${SHIPPO_API_URL}${endpoint}`

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `ShippoToken ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.detail || data.message || 'Shippo API error')
        }

        return data
    }

    /**
     * Validate a shipping address
     * @param {Object} address - Address to validate
     * @returns {Object} Validation result with is_valid flag and messages
     */
    async validateAddress(address) {
        try {
            const shippoAddress = await this.request('/addresses', {
                method: 'POST',
                body: JSON.stringify({
                    name: address.full_name || address.name,
                    street1: address.address_line_1 || address.line1 || address.street1,
                    street2: address.address_line_2 || address.line2 || address.street2 || '',
                    city: address.city,
                    state: address.state,
                    zip: address.postal_code || address.zip,
                    country: address.country || 'US',
                    phone: address.phone || '',
                    email: address.email || '',
                    validate: true,
                }),
            })

            return {
                is_valid: shippoAddress.validation_results?.is_valid ?? false,
                messages: shippoAddress.validation_results?.messages || [],
                suggested_address: shippoAddress.validation_results?.is_valid ? null : {
                    street1: shippoAddress.street1,
                    street2: shippoAddress.street2,
                    city: shippoAddress.city,
                    state: shippoAddress.state,
                    zip: shippoAddress.zip,
                    country: shippoAddress.country,
                },
                object_id: shippoAddress.object_id,
                raw: shippoAddress,
            }
        } catch (error) {
            console.error('Address validation error:', error)
            throw error
        }
    }

    /**
     * Create a Shippo address object
     * @param {Object} address - Address details
     * @returns {Object} Shippo address object
     */
    async createAddress(address) {
        return this.request('/addresses', {
            method: 'POST',
            body: JSON.stringify({
                name: address.full_name || address.name,
                company: address.company || '',
                street1: address.address_line_1 || address.line1 || address.street1,
                street2: address.address_line_2 || address.line2 || address.street2 || '',
                city: address.city,
                state: address.state,
                zip: address.postal_code || address.zip,
                country: address.country || 'US',
                phone: address.phone || '',
                email: address.email || '',
            }),
        })
    }

    /**
     * Create a parcel object
     * @param {Object} parcel - Parcel dimensions and weight
     * @returns {Object} Shippo parcel object
     */
    async createParcel(parcel) {
        return this.request('/parcels', {
            method: 'POST',
            body: JSON.stringify({
                length: parcel.length || '10',
                width: parcel.width || '8',
                height: parcel.height || '4',
                distance_unit: parcel.distance_unit || 'in',
                weight: parcel.weight || '1',
                mass_unit: parcel.mass_unit || 'lb',
            }),
        })
    }

    /**
     * Get shipping rates for a shipment
     * @param {Object} params - Shipment parameters
     * @returns {Array} Available shipping rates
     */
    async getShippingRates({ fromAddress, toAddress, parcel, async = false }) {
        try {
            // Create addresses if they're not already Shippo objects
            let addressFrom = fromAddress
            let addressTo = toAddress
            let parcelObj = parcel

            if (!fromAddress.object_id) {
                const fromResult = await this.createAddress(fromAddress)
                addressFrom = fromResult.object_id
            } else {
                addressFrom = fromAddress.object_id
            }

            if (!toAddress.object_id) {
                const toResult = await this.createAddress(toAddress)
                addressTo = toResult.object_id
            } else {
                addressTo = toAddress.object_id
            }

            if (!parcel.object_id) {
                const parcelResult = await this.createParcel(parcel)
                parcelObj = parcelResult.object_id
            } else {
                parcelObj = parcel.object_id
            }

            // Create shipment to get rates
            const shipment = await this.request('/shipments', {
                method: 'POST',
                body: JSON.stringify({
                    address_from: addressFrom,
                    address_to: addressTo,
                    parcels: [parcelObj],
                    async: async,
                }),
            })

            // Format rates for easier consumption
            const rates = shipment.rates?.map(rate => ({
                id: rate.object_id,
                provider: rate.provider,
                service: rate.servicelevel?.name || rate.servicelevel?.token,
                service_token: rate.servicelevel?.token,
                amount: parseFloat(rate.amount),
                currency: rate.currency,
                estimated_days: rate.estimated_days,
                duration_terms: rate.duration_terms,
                arrives_by: rate.arrives_by,
                attributes: rate.attributes || [],
                carrier_account: rate.carrier_account,
            })) || []

            // Sort by price
            rates.sort((a, b) => a.amount - b.amount)

            return {
                shipment_id: shipment.object_id,
                rates,
                messages: shipment.messages || [],
            }
        } catch (error) {
            console.error('Get shipping rates error:', error)
            throw error
        }
    }

    /**
     * Purchase a shipping label
     * @param {string} rateId - The rate object_id to purchase
     * @returns {Object} Transaction with label details
     */
    async purchaseLabel(rateId) {
        try {
            const transaction = await this.request('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    rate: rateId,
                    label_file_type: 'PDF',
                    async: false,
                }),
            })

            return {
                id: transaction.object_id,
                status: transaction.status,
                tracking_number: transaction.tracking_number,
                tracking_url: transaction.tracking_url_provider,
                label_url: transaction.label_url,
                commercial_invoice_url: transaction.commercial_invoice_url,
                eta: transaction.eta,
                messages: transaction.messages || [],
                rate: {
                    amount: transaction.rate?.amount,
                    currency: transaction.rate?.currency,
                    provider: transaction.rate?.provider,
                    service: transaction.rate?.servicelevel?.name,
                },
            }
        } catch (error) {
            console.error('Purchase label error:', error)
            throw error
        }
    }

    /**
     * Create a shipment and purchase a label in one step
     * @param {Object} params - Shipment and label parameters
     * @returns {Object} Transaction with label details
     */
    async createShipmentAndLabel({ fromAddress, toAddress, parcel, servicelevel_token, carrier_account }) {
        try {
            const transaction = await this.request('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    shipment: {
                        address_from: {
                            name: fromAddress.full_name || fromAddress.name,
                            street1: fromAddress.address_line_1 || fromAddress.street1,
                            street2: fromAddress.address_line_2 || fromAddress.street2 || '',
                            city: fromAddress.city,
                            state: fromAddress.state,
                            zip: fromAddress.postal_code || fromAddress.zip,
                            country: fromAddress.country || 'US',
                            phone: fromAddress.phone || '',
                            email: fromAddress.email || '',
                        },
                        address_to: {
                            name: toAddress.full_name || toAddress.name,
                            street1: toAddress.address_line_1 || toAddress.street1,
                            street2: toAddress.address_line_2 || toAddress.street2 || '',
                            city: toAddress.city,
                            state: toAddress.state,
                            zip: toAddress.postal_code || toAddress.zip,
                            country: toAddress.country || 'US',
                            phone: toAddress.phone || '',
                            email: toAddress.email || '',
                        },
                        parcels: [{
                            length: parcel.length || '10',
                            width: parcel.width || '8',
                            height: parcel.height || '4',
                            distance_unit: parcel.distance_unit || 'in',
                            weight: parcel.weight || '1',
                            mass_unit: parcel.mass_unit || 'lb',
                        }],
                    },
                    carrier_account: carrier_account,
                    servicelevel_token: servicelevel_token,
                    label_file_type: 'PDF',
                }),
            })

            return {
                id: transaction.object_id,
                status: transaction.status,
                tracking_number: transaction.tracking_number,
                tracking_url: transaction.tracking_url_provider,
                label_url: transaction.label_url,
                messages: transaction.messages || [],
            }
        } catch (error) {
            console.error('Create shipment and label error:', error)
            throw error
        }
    }

    /**
     * Track a shipment by tracking number
     * @param {string} carrier - Carrier name (e.g., 'usps', 'ups', 'fedex')
     * @param {string} trackingNumber - The tracking number
     * @returns {Object} Tracking status and history
     */
    async trackShipment(carrier, trackingNumber) {
        try {
            const tracking = await this.request(`/tracks/${carrier}/${trackingNumber}`)

            return {
                carrier: tracking.carrier,
                tracking_number: tracking.tracking_number,
                status: tracking.tracking_status?.status,
                status_details: tracking.tracking_status?.status_details,
                status_date: tracking.tracking_status?.status_date,
                location: tracking.tracking_status?.location,
                eta: tracking.eta,
                original_eta: tracking.original_eta,
                history: tracking.tracking_history?.map(event => ({
                    status: event.status,
                    status_details: event.status_details,
                    status_date: event.status_date,
                    location: event.location,
                })) || [],
                address_from: tracking.address_from,
                address_to: tracking.address_to,
            }
        } catch (error) {
            console.error('Track shipment error:', error)
            throw error
        }
    }

    /**
     * Register a tracking webhook for a shipment
     * @param {string} carrier - Carrier name
     * @param {string} trackingNumber - The tracking number
     * @returns {Object} Tracking registration result
     */
    async registerTracking(carrier, trackingNumber) {
        return this.request('/tracks', {
            method: 'POST',
            body: JSON.stringify({
                carrier: carrier,
                tracking_number: trackingNumber,
            }),
        })
    }

    /**
     * Get available carrier accounts
     * @returns {Array} List of carrier accounts
     */
    async getCarrierAccounts() {
        const response = await this.request('/carrier_accounts')
        return response.results || []
    }
}

// Export singleton instance
const shippo = new ShippoClient()

export { ShippoClient }
export default shippo
