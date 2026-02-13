import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function Page({ searchParams }) {
  // Handle OAuth callback codes that might land on root
  const code = searchParams?.code
  const token_hash = searchParams?.token_hash
  const type = searchParams?.type

  if (code || (token_hash && type)) {
    // Build query string to preserve auth parameters
    const params = new URLSearchParams()
    if (code) params.set('code', code)
    if (token_hash) params.set('token_hash', token_hash)
    if (type) params.set('type', type)
    if (searchParams?.next) params.set('next', searchParams.next)

    redirect(`/auth/callback?${params.toString()}`)
  }

  redirect(`/${routing.defaultLocale}`)
}