import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  try {
    // Create Supabase client using the new server utility
    const supabase = await createClient()

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    return NextResponse.json({
      debug: {
        environment: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        },
        session: {
          hasSession: !!session,
          sessionError: sessionError?.message,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at,
          accessToken: session?.access_token ? 'present' : 'missing'
        },
        user: {
          hasUser: !!user,
          userError: userError?.message,
          userId: user?.id,
          userEmail: user?.email
        }
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message
    }, { status: 500 })
  }
} 