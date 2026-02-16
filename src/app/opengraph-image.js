import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DepxTech - Premium Electronics & Trade-In'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 900, color: 'white' }}>D</span>
        </div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: 'white',
            margin: 0,
            letterSpacing: -2,
          }}
        >
          DepxTech
        </h1>
        <p
          style={{
            fontSize: 24,
            color: '#94a3b8',
            marginTop: 16,
            letterSpacing: 1,
          }}
        >
          Premium Electronics & Trade-In
        </p>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
          }}
        >
          {['Shop', 'Trade-In', 'Best Prices'].map((text) => (
            <div
              key={text}
              style={{
                padding: '10px 24px',
                borderRadius: 999,
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: 18,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
