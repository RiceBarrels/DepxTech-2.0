import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@supabase/supabase-js'

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (id) {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
      }

      return NextResponse.json({ success: true, post })
    }

    if (slug) {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
      }

      return NextResponse.json({ success: true, post })
    }

    // List all posts (admin sees everything including drafts)
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ success: true, posts: posts || [] })
  } catch (error) {
    console.error('Error in admin blog GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const body = await request.json()

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!body.slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const insertData = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      category: body.category || 'Guides',
      author: body.author || 'DepxTech Team',
      date: body.date || new Date().toISOString().split('T')[0],
      read_time: body.read_time || null,
      image: body.image || null,
      featured: body.featured || false,
      content: body.content || '',
      published: body.published || false,
      title_i18n: body.title_i18n || {},
      excerpt_i18n: body.excerpt_i18n || {},
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
      }
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error('Error in admin blog POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const updateData = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      category: body.category || 'Guides',
      author: body.author || 'DepxTech Team',
      date: body.date || new Date().toISOString().split('T')[0],
      read_time: body.read_time || null,
      image: body.image || null,
      featured: body.featured || false,
      content: body.content || '',
      published: body.published || false,
      title_i18n: body.title_i18n || {},
      excerpt_i18n: body.excerpt_i18n || {},
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
      }
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error('Error in admin blog PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Get the post first to clean up cover image
    const { data: post } = await supabase
      .from('blog_posts')
      .select('image')
      .eq('id', id)
      .single()

    // Delete cover image from storage if it exists in our bucket
    if (post?.image && post.image.includes('/storage/v1/object/public/images/blog/')) {
      const path = post.image.split('/storage/v1/object/public/images/')[1]
      if (path) {
        await supabase.storage.from('images').remove([path])
      }
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin blog DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
