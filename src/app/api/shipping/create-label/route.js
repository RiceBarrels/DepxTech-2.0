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

        // Check if user is admin (only admins can create labels)
        const { data: profileData } = await supabase
            .from('profile_customer_readonly')
            .select('role')
            .eq('id', user.id)

        const isAdmin = profileData?.some(p => p.role === 'admin')
        if (!isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { rate_id, transaction_id } = body

        if (!rate_id) {
            return NextResponse.json(
                { success: false, error: 'Rate ID is required' },
                { status: 400 }
            )
        }

        // Purchase the label
        const labelResult = await shippo.purchaseLabel(rate_id)

        // If transaction_id is provided, update the transaction with shipping info
        if (transaction_id && labelResult.status === 'SUCCESS') {
            const { error: updateError } = await supabase
                .from('transactions')
                .update({
                    shipping_details: JSON.stringify({
                        tracking_number: labelResult.tracking_number,
                        tracking_url: labelResult.tracking_url,
                        label_url: labelResult.label_url,
                        carrier: labelResult.rate?.provider,
                        service: labelResult.rate?.service,
                        shipping_cost: labelResult.rate?.amount,
                        shipped_at: new Date().toISOString(),
                    }),
                    order_status: 'shipped',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', transaction_id)

            if (updateError) {
                console.error('Error updating transaction:', updateError)
            }
        }

        return NextResponse.json({
            success: labelResult.status === 'SUCCESS',
            label: {
                id: labelResult.id,
                status: labelResult.status,
                tracking_number: labelResult.tracking_number,
                tracking_url: labelResult.tracking_url,
                label_url: labelResult.label_url,
                eta: labelResult.eta,
                rate: labelResult.rate,
            },
            messages: labelResult.messages,
        })
    } catch (error) {
        console.error('Create label error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create shipping label' },
            { status: 500 }
        )
    }
}
