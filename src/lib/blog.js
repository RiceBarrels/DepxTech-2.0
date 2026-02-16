import { supabaseAdmin } from '@/lib/supabase-admin'
import { resolveBlogPost } from '@/lib/i18n-db'

function resolveAll(posts, locale) {
  if (!locale || locale === 'en') return posts
  return posts.map((p) => resolveBlogPost(p, locale))
}

// Fetch all published posts, sorted by date descending
export async function getAllPosts(locale) {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return resolveAll(data || [], locale)
}

// Fetch featured published posts
export async function getFeaturedPosts(locale) {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }

  return resolveAll(data || [], locale)
}

// Fetch a single post by slug (published only for public)
export async function getPostBySlug(slug, locale) {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    return null
  }

  return locale ? resolveBlogPost(data, locale) : data
}

// Fetch posts by category
export async function getPostsByCategory(category, locale) {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }

  return resolveAll(data || [], locale)
}

// Get all unique categories from published posts
export async function getAllCategories() {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('category')
    .eq('published', true)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = [...new Set((data || []).map((p) => p.category).filter(Boolean))]
  return categories
}

// Get related posts (same category, excluding current)
export async function getRelatedPosts(currentSlug, limit = 3, locale) {
  const current = await getPostBySlug(currentSlug)
  if (!current) return []

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', current.category)
    .neq('slug', currentSlug)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching related posts:', error)
    return []
  }

  return resolveAll(data || [], locale)
}

// Get all published post slugs (for generateStaticParams)
export async function getAllPostSlugs() {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('slug')
    .eq('published', true)

  if (error) {
    console.error('Error fetching post slugs:', error)
    return []
  }

  return (data || []).map((p) => p.slug)
}
