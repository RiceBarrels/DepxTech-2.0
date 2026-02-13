import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Handle OAuth callback
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    } else {
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'OAuth authentication failed')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle OTP verification (password reset, etc.)
  if (token_hash && type) {
    const supabase = await createClient()

    // Verify the OTP token from the password reset email
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (!error) {
      // After successful verification, the session is automatically created
      // Redirect to the reset password page
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    } else {
      // If verification fails, redirect to login with error
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'Invalid or expired reset link')
      return NextResponse.redirect(loginUrl)
    }
  }

  // If there's no token or type, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
