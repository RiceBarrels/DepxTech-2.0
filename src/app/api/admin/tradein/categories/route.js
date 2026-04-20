import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE
    )
}

// GET - Fetch all trade categories (no admin check — needed by CategorySelect and public pages)
export async function GET() {
    try {
        const { data: categories, error } = await getSupabaseAdmin()
            .from('trade_categories')
            .select('*')
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
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const body = await request.json()
        const { name, description, img, icon, display_order, is_active } = body

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
        }

        const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        const insertData = {
            name: name.trim(),
            slug,
            description: description || null,
            img: img || null,
            icon: icon || 'Package',
            display_order: display_order ?? 0,
            is_active: is_active !== false,
        }

        const { data: category, error } = await getSupabaseAdmin()
            .from('trade_categories')
            .insert(insertData)
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

// PUT - Update a trade category
export async function PUT(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
        }

        const updateData = { updated_at: new Date().toISOString() }
        if (body.name !== undefined) {
            updateData.name = body.name.trim()
            updateData.slug = body.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }
        if (body.description !== undefined) updateData.description = body.description || null
        if (body.img !== undefined) updateData.img = body.img || null
        if (body.icon !== undefined) updateData.icon = body.icon || 'Package'
        if (body.display_order !== undefined) updateData.display_order = body.display_order
        if (body.is_active !== undefined) updateData.is_active = body.is_active
        if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
        if (body.is_popular !== undefined) updateData.is_popular = body.is_popular

        const { data: category, error } = await getSupabaseAdmin()
            .from('trade_categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
            }
            console.error('Error updating category:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ category })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

// DELETE - Delete a trade category
export async function DELETE(request) {
    try {
        const adminVerification = await verifyAdminAccess(request)
        if (!adminVerification.authorized) {
            return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
        }

        const { error } = await getSupabaseAdmin()
            .from('trade_categories')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting category:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
