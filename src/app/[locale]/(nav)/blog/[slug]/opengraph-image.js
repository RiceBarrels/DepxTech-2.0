import { ImageResponse } from 'next/og'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'edge'
export const alt = 'Blog Post - DepxTech'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }) {
  const { slug } = await params

  let title = 'Blog Post'
  let category = ''

  try {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('title, category')
      .eq('slug', slug)
      .single()
    if (data) {
      title = data.title || 'Blog Post'
      category = data.category || ''
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: 80,
          textAlign: 'center',
        }}
      >
        {category && (
          <div style={{ fontSize: 18, color: '#3b82f6', fontWeight: 600, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
            {category}
          </div>
        )}
        <div style={{ fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1.2, maxWidth: '90%' }}>
          {title.length > 80 ? title.slice(0, 80) + '...' : title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>D</span>
          </div>
          <span style={{ fontSize: 20, color: '#94a3b8' }}>DepxTech Blog</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
