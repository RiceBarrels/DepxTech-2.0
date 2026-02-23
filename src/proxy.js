import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request) {
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|zh-CN|zh-TW|ar|nl|fr|de|it|ja|ko|pl|pt|ru|es|sv)/:path*']
};
