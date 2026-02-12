import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './utils/supabase/session'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request) {
  // Run next-intl middleware first for locale handling
  const intlResponse = intlMiddleware(request)

  // If next-intl returned a redirect (e.g. adding locale prefix), return it directly
  if (intlResponse.status !== 200) {
    return intlResponse
  }

  // Then run Supabase session update (refreshes auth tokens, redirects unauthenticated users)
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!api|auth|_next|_vercel|.*\\..*).*)',
    '/'
  ]
}
