import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Product - DepxTech'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }) {
  const { id } = await params

  let title = 'Product'
  let price = null
  let image = null

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://depxtech.com'
    const res = await fetch(`${apiUrl}/api/products?id=${id}`)
    const data = await res.json()
    const product = data.products?.[0]
    if (product) {
      title = product.title || 'Product'
      price = product.price
      image = product.imgs?.[0]
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
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: 60,
          gap: 60,
        }}
      >
        {image && (
          <div style={{ display: 'flex', width: 280, height: 280, borderRadius: 24, background: '#1e293b', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #334155', flexShrink: 0 }}>
            <img src={image} width={240} height={240} style={{ objectFit: 'contain' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 16, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            DepxTech
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
            {title.length > 60 ? title.slice(0, 60) + '...' : title}
          </div>
          {price != null && (
            <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6' }}>
              ${Number(price).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
