'use client'

import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'
import { Link as TransitionLink } from 'next-view-transitions'
import { useParams } from 'next/navigation'

// Get navigation utilities from next-intl
const { redirect, usePathname, useRouter, getPathname } = createNavigation(routing)

// Create a Link component that combines next-intl locale handling with next-view-transitions
export function Link({ href, ...props }) {
  const params = useParams()
  const locale = params?.locale

  // If href is a string and doesn't already start with a locale, prefix it
  const localizedHref = typeof href === 'string' && locale && !href.startsWith(`/${locale}`)
    ? `/${locale}${href.startsWith('/') ? '' : '/'}${href}`
    : href

  return <TransitionLink href={localizedHref} {...props} />
}

export { redirect, usePathname, useRouter, getPathname }
