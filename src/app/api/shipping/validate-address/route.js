import { NextResponse } from 'next/server'
import shippo from '@/lib/shippo'
import { createClient } from '@/utils/supabase/server'

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
        const { address } = body

        if (!address) {
            return NextResponse.json(
                { success: false, error: 'Address is required' },
                { status: 400 }
            )
        }

        // Required fields
        const requiredFields = ['address_line_1', 'city', 'state', 'postal_code']
        for (const field of requiredFields) {
            if (!address[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        const validationResult = await shippo.validateAddress(address)

        return NextResponse.json({
            success: true,
            is_valid: validationResult.is_valid,
            messages: validationResult.messages,
            suggested_address: validationResult.suggested_address,
            object_id: validationResult.object_id,
        })
    } catch (error) {
        console.error('Address validation error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to validate address' },
            { status: 500 }
        )
    }
}
