import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE
    )
}

// GET - Fetch all trade categories
export async function GET() {
    try {
        const { data: categories, error } = await getSupabaseAdmin()
            .from('trade_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

// POST - Create a new trade category
export async function POST(request) {
    try {
        const body = await request.json()
        const { name } = body

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
        }

        const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        const { data: category, error } = await getSupabaseAdmin()
            .from('trade_categories')
            .insert({ name: name.trim(), slug })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
            }
            console.error('Error creating category:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ category })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
