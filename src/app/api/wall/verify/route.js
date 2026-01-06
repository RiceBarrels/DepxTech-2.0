import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.SITE_PASSWORD || 'depxtech2024'
    
    if (password === correctPassword) {
      // Set cookie that expires in 30 days
      const expires = new Date()
      expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      const cookieStore = await cookies()
      cookieStore.set('site_password_auth', 'true', {
        expires: expires,
        path: '/',
        sameSite: 'lax',
        httpOnly: false, // Allow client-side access
      })
      
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}


