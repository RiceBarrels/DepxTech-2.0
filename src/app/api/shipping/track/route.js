import { NextResponse } from 'next/server'
import shippo from '@/lib/shippo'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const carrier = searchParams.get('carrier')
        const trackingNumber = searchParams.get('tracking_number')

        if (!carrier || !trackingNumber) {
            return NextResponse.json(
                { success: false, error: 'Carrier and tracking number are required' },
                { status: 400 }
            )
        }

        const trackingResult = await shippo.trackShipment(carrier, trackingNumber)

        return NextResponse.json({
            success: true,
            tracking: trackingResult,
        })
    } catch (error) {
        console.error('Track shipment error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to track shipment' },
            { status: 500 }
        )
    }
}

// Register tracking webhook for a shipment
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
        const { carrier, tracking_number } = body

        if (!carrier || !tracking_number) {
            return NextResponse.json(
                { success: false, error: 'Carrier and tracking number are required' },
                { status: 400 }
            )
        }

        const result = await shippo.registerTracking(carrier, tracking_number)

        return NextResponse.json({
            success: true,
            tracking: result,
        })
    } catch (error) {
        console.error('Register tracking error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to register tracking' },
            { status: 500 }
        )
    }
}
