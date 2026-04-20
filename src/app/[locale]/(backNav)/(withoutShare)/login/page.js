'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeftIcon, ArrowRightIcon, LogInIcon } from 'lucide-react'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useWebHaptics } from 'web-haptics/react'

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mobileStep, setMobileStep] = useState(0) // 0: email, 1: password
  const router = useTransitionRouter()
  const { trigger } = useWebHaptics()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        trigger('error')
      } else {
        trigger('success')
        await router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      trigger('error')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  const handleMobileNext = () => {
    if (!email) {
      setError('Please enter your email')
      trigger('error')
      return
    }
    setError('')
    setMobileStep(1)
  }

  return (
    <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">

      <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
        <div className="flex flex-col md:flex-row w-full md:h-144 items-center m-0 md:m-8 md:border rounded-2xl md:rounded-4xl">
          <div className="w-full flex flex-col md:h-100 p-6 pb-4 md:p-12 gap-3 md:gap-5">
            <h1 className="text-xl md:text-2xl font-black">DepxTech</h1>
            <h2 className="text-2xl md:text-4xl font-bold flex items-center gap-3 md:gap-4">
              <LogInIcon className="size-6 md:size-8" />
              {t('heading')}
            </h2>
            <p className="text-sm md:text-md">
              {t('subheading')}
            </p>
          </div>
          <div className="h-124 hidden md:block">
            <Separator orientation="vertical" className="h-124"/>
          </div>
          <div className="w-full px-6 block md:hidden">
            <Separator orientation="horizontal"/>
          </div>
          <div className="w-full flex flex-col p-4 pt-2 md:p-12">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mx-2 md:mx-4 mb-2">
                {error}
              </div>
            )}

            {/* OAuth – hidden on mobile step 1+ */}
            <div className={cn("space-y-4 w-full p-2 md:p-4", mobileStep > 0 && "max-md:hidden")}>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('apple')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 w-full p-2 md:p-4">
              {/* Mobile: back to email step */}
              {mobileStep > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { trigger('selection'); setMobileStep(0); setError('') }}
                  className="md:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="size-3.5" />
                  {email}
                </Button>
              )}

              {/* Email – hidden on mobile step 1 */}
              <div className={cn(mobileStep > 0 && "max-md:hidden")}>
                <label htmlFor="email" className="block font-medium mb-1">
                  {t('emailLabel')}
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="w-full"
                />
              </div>

              {/* Mobile: Continue button (step 0 only) */}
              <Button
                type="button"
                onClick={handleMobileNext}
                className={cn("w-full", mobileStep > 0 ? "hidden" : "md:hidden")}
              >
                Continue
                <ArrowRightIcon className="size-4 ml-2" />
              </Button>

              {/* Password – hidden on mobile step 0 */}
              <div className={cn(mobileStep === 0 && "max-md:hidden")}>
                <label htmlFor="password" className="block font-medium mb-1">
                  {t('passwordLabel')}
                </label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('passwordPlaceholder')}
                  className="w-full"
                />
              </div>

              {/* Submit – hidden on mobile step 0 */}
              <Button
                type="submit"
                disabled={loading}
                className={cn("w-full", mobileStep === 0 && "max-md:hidden")}
              >
                {loading ? t('buttonLoading') : t('button')}
              </Button>

              <div className={cn("flex items-center justify-between text-sm", mobileStep === 0 && "max-md:hidden")}>
                <TransitionLink href="/forgot-password" className="text-primary underline">
                  {t('forgotPassword')}
                </TransitionLink>
                <span className="text-muted-foreground">
                  {t('noAccount', { default: "Don't have an account?" })}{' '}
                  <TransitionLink href="/signup" className="text-primary underline font-medium">
                    {t('createAccount')}
                  </TransitionLink>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
