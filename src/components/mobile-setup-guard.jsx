'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { useAuth } from '@/lib/auth'
import { usePathname } from 'next/navigation'
import MobileSetupScreen from './mobile-setup-screen'

export default function MobileSetupGuard({ children }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [isNative, setIsNative] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if running on native platform
    setIsNative(Capacitor.isNativePlatform())
    setMounted(true)
  }, [])

  // Show children while checking platform (prevents flash of blank screen)
  if (!mounted) {
    return <>{children}</>
  }

  // Allow login, signup, and auth pages to display normally
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/signup') || 
                     pathname?.startsWith('/auth') ||
                     pathname?.startsWith('/forgot-password') ||
                     pathname?.startsWith('/reset-password')

  // Show setup screen if:
  // 1. Running on native mobile platform
  // 2. User is not logged in
  // 3. Auth loading is complete
  // 4. Not on an auth page (login/signup/etc)
  // This ensures first-time users on native mobile see the setup screen, but can still access login/signup
  if (isNative && !loading && !user && !isAuthPage) {
    return <MobileSetupScreen />
  }

  return <>{children}</>
}

