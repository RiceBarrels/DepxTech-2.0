import { NextResponse } from 'next/server'
import shippo from '@/lib/shippo'
import { createClient } from '@/utils/supabase/server'

// Default store/warehouse address - configure in environment variables
const STORE_ADDRESS = {
    name: process.env.STORE_NAME || 'DepxTech Store',
    street1: process.env.STORE_ADDRESS_LINE_1 || '123 Commerce St',
    street2: process.env.STORE_ADDRESS_LINE_2 || '',
    city: process.env.STORE_CITY || 'Los Angeles',
    state: process.env.STORE_STATE || 'CA',
    zip: process.env.STORE_ZIP || '90001',
    country: process.env.STORE_COUNTRY || 'US',
    phone: process.env.STORE_PHONE || '',
    email: process.env.STORE_EMAIL || '',
}

// Default parcel sizes based on cart value/items
const PARCEL_SIZES = {
    small: { length: '8', width: '6', height: '4', weight: '0.5' },
    medium: { length: '12', width: '10', height: '6', weight: '2' },
    large: { length: '18', width: '14', height: '10', weight: '5' },
}

export async function POST(request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { toAddress, parcel, cartItems } = body

        if (!toAddress) {
            return NextResponse.json(
                { success: false, error: 'Destination address is required' },
                { status: 400 }
            )
        }

        // Required fields for destination
        const requiredFields = ['address_line_1', 'city', 'state', 'postal_code']
        for (const field of requiredFields) {
            if (!toAddress[field] && !toAddress[field.replace('address_line_1', 'street1')]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Determine parcel size based on cart items or use provided parcel
        let parcelData = parcel
        if (!parcelData) {
            // Auto-determine parcel size based on number of items or total weight
            const itemCount = cartItems?.length || 1
            if (itemCount <= 2) {
                parcelData = PARCEL_SIZES.small
            } else if (itemCount <= 5) {
                parcelData = PARCEL_SIZES.medium
            } else {
                parcelData = PARCEL_SIZES.large
            }
        }

        const ratesResult = await shippo.getShippingRates({
            fromAddress: STORE_ADDRESS,
            toAddress: {
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
            parcel: parcelData,
        })

        // Filter to show only common carriers and sort by price
        const filteredRates = ratesResult.rates.filter(rate => {
            // Include major carriers
            const majorCarriers = ['usps', 'ups', 'fedex', 'dhl_express']
            return majorCarriers.some(carrier =>
                rate.provider?.toLowerCase().includes(carrier)
            )
        })

        return NextResponse.json({
            success: true,
            shipment_id: ratesResult.shipment_id,
            rates: filteredRates.length > 0 ? filteredRates : ratesResult.rates,
            all_rates: ratesResult.rates,
            messages: ratesResult.messages,
        })
    } catch (error) {
        console.error('Get shipping rates error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to get shipping rates' },
            { status: 500 }
        )
    }
}
