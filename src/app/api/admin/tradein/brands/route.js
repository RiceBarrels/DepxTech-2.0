import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'


export async function GET() {
  try {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
    }

    return NextResponse.json({ success: true, brands: data || [] })
  } catch (error) {
    console.error('Error in brands GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { name, img } = await request.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    }

    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('brands')
      .insert({ name: name.trim(), img: img || null })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Brand already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
    }

    return NextResponse.json({ success: true, brand: data })
  } catch (error) {
    console.error('Error in brands POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { id, name, img } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    const updateData = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name.trim()
    if (img !== undefined) updateData.img = img || null

    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Brand name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
    }

    return NextResponse.json({ success: true, brand: data })
  } catch (error) {
    console.error('Error in brands PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json({ error: adminVerification.error }, { status: adminVerification.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    const supabase = supabaseAdmin
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in brands DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
