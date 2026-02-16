import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'

// Create Supabase client with service role for admin operations
function createServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// GET - Fetch all question templates
export async function GET(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const supabase = createServiceRoleClient()

        const { data: templates, error } = await supabase
            .from('trade_question_templates')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching templates:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Optionally attach linked product counts
        const { searchParams } = new URL(request.url)
        if (searchParams.get('withCounts') === 'true' && templates?.length) {
            const { data: links } = await supabase
                .from('tradable_products')
                .select('question_template_id')
                .not('question_template_id', 'is', null)

            const countMap = {}
            links?.forEach(row => {
                countMap[row.question_template_id] = (countMap[row.question_template_id] || 0) + 1
            })
            templates.forEach(t => {
                t.linked_product_count = countMap[t.id] || 0
            })
        }

        return NextResponse.json({ templates })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }
}

// POST - Create a new question template
export async function POST(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const body = await request.json()
        const { name, questions = [] } = body

        if (!name) {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
        }

        const { data: template, error } = await createServiceRoleClient()
            .from('trade_question_templates')
            .insert({
                name,
                questions
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ template })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }
}

// PUT - Update a question template + propagate to linked products
export async function PUT(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const body = await request.json()
        const { id, name, questions } = body

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
        }

        const supabase = createServiceRoleClient()

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (questions !== undefined) updateData.questions = questions

        const { data: template, error } = await supabase
            .from('trade_question_templates')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Propagate question changes to all linked products
        let updatedProductCount = 0
        if (questions !== undefined) {
            const { data: updatedProducts, error: propagateError } = await supabase
                .from('tradable_products')
                .update({ questions })
                .eq('question_template_id', id)
                .select('id')

            if (propagateError) {
                console.error('Error propagating template changes:', propagateError)
            } else {
                updatedProductCount = updatedProducts?.length || 0
            }
        }

        return NextResponse.json({ template, updatedProductCount })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }
}

// DELETE - Delete a question template
export async function DELETE(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
        }

        const { error } = await createServiceRoleClient()
            .from('trade_question_templates')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }
}
