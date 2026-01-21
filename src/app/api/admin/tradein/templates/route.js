import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET - Fetch all question templates
export async function GET(request) {
    try {
        const { data: templates, error } = await supabaseAdmin
            .from('trade_question_templates')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching templates:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
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
        const body = await request.json()
        const { name, questions = [] } = body

        if (!name) {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
        }

        const { data: template, error } = await supabaseAdmin
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

// PUT - Update a question template
export async function PUT(request) {
    try {
        const body = await request.json()
        const { id, name, questions } = body

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
        }

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (questions !== undefined) updateData.questions = questions

        const { data: template, error } = await supabaseAdmin
            .from('trade_question_templates')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating template:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ template })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }
}

// DELETE - Delete a question template
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
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
