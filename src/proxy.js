import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request) {
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except Next.js internals and static files
  matcher: ['/((?!_next|api|auth|.*\\..*).*)']
};
