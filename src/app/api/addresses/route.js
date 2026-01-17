import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Fetch all addresses for the authenticated user
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            addresses: addresses || []
        })
    } catch (error) {
        console.error('Fetch addresses error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch addresses' },
            { status: 500 }
        )
    }
}

// POST - Create a new address
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
        const {
            full_name,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            phone,
            is_default
        } = body

        // Validate required fields
        if (!full_name || !address_line_1 || !city || !state || !postal_code) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const { data: address, error } = await supabase
            .from('addresses')
            .insert({
                user_id: user.id,
                full_name,
                address_line_1,
                address_line_2: address_line_2 || null,
                city,
                state,
                postal_code,
                country: country || 'US',
                phone: phone || null,
                is_default: is_default || false
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            address
        })
    } catch (error) {
        console.error('Create address error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create address' },
            { status: 500 }
        )
    }
}

// PUT - Update an existing address
export async function PUT(request) {
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
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Address ID is required' },
                { status: 400 }
            )
        }

        // Make sure the address belongs to the user
        const { data: existingAddress } = await supabase
            .from('addresses')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!existingAddress) {
            return NextResponse.json(
                { success: false, error: 'Address not found' },
                { status: 404 }
            )
        }

        const { data: address, error } = await supabase
            .from('addresses')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            address
        })
    } catch (error) {
        console.error('Update address error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update address' },
            { status: 500 }
        )
    }
}

// DELETE - Delete an address
export async function DELETE(request) {
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
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Address ID is required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            throw error
        }

        return NextResponse.json({
            success: true,
            message: 'Address deleted successfully'
        })
    } catch (error) {
        console.error('Delete address error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete address' },
            { status: 500 }
        )
    }
}
