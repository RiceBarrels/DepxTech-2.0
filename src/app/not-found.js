import Link from 'next/link'


export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: 0 }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
          <Link href="/" style={{ color: '#000', textDecoration: 'underline' }}>
            Go Home
          </Link>
        </div>
      </body>
    </html>
  )
}
