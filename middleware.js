import { updateSession } from './src/utils/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Check for password authentication cookie
  const passwordAuth = request.cookies.get('site_password_auth')
  
  // Allow access to static files, API routes, and auth routes without password check
  const isStaticFile = request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(request.nextUrl.pathname)
  
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  
  // If it's not a static file, API route, or auth route, check password
  if (!isStaticFile && !isApiRoute && !isAuthRoute) {
    // If password is required but not authenticated, allow through
    // The client-side PasswordWall component will handle the actual blocking
    // This middleware check is mainly for additional security
  }
  
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 