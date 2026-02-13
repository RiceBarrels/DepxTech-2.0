'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { UserPlusIcon, MailIcon, KeyIcon, CheckCircleIcon, Loader2Icon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function SignupPage() {
  const t = useTranslations('auth.signup')
  const tCommon = useTranslations('common')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1) // 1: info, 2: verify code
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useTransitionRouter()

  // Start cooldown timer for resend button
  const startCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'))
      setLoading(false)
      return
    }

    if (!/[a-z]/.test(password)) {
      setError(t('passwordNoLowercase'))
      setLoading(false)
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError(t('passwordNoUppercase'))
      setLoading(false)
      return
    }

    if (!/[0-9]/.test(password)) {
      setError(t('passwordNoNumber'))
      setLoading(false)
      return
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password)) {
      setError(t('passwordNoSpecial'))
      setLoading(false)
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError(t('nameRequired'))
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const fullName = `${firstName.trim()} ${lastName.trim()}`

      // Sign up with email confirmation disabled (we'll verify with OTP)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            full_name: fullName
          },
          // Don't send email confirmation link, we'll use OTP
          emailRedirectTo: undefined
        }
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // If user already exists and is confirmed
      if (data?.user?.identities?.length === 0) {
        setError(t('accountExists'))
        setLoading(false)
        return
      }

      // Send OTP verification code
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // User already created above
        }
      })

      if (otpError) {
        // If OTP fails, the account was still created, just needs verification
        console.error('OTP error:', otpError)
        setMessage(t('accountCreated'))
      } else {
        setMessage(t('verificationSent'))
      }

      setStep(2)
      startCooldown()
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid 6-digit verification code')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setMessage(t('emailVerified'))

      // Redirect to home page after successful verification
      setTimeout(async () => {
        await router.push('/')
      }, 1500)
    } catch (err) {
      console.error('Verification error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage(t('verificationSent'))
        startCooldown()
      }
    } catch (err) {
      setError('Failed to resend code')
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

  const handleBack = () => {
    setStep(1)
    setVerificationCode('')
    setError('')
    setMessage('')
  }

  return (
    <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">

      <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
        <div className="flex flex-col md:flex-row w-full md:min-h-100 items-center m-4 md:m-8 border rounded-2xl md:rounded-4xl">
          <div className="w-full flex flex-col md:min-h-100 p-6 pb-4 md:p-12 gap-3 md:gap-5 justify-center">
            <h1 className="text-xl md:text-2xl font-black">DepxTech</h1>
            <h2 className="text-2xl md:text-4xl font-bold flex items-center gap-3 md:gap-4">
              {step === 1 ? (
                <>
                  <UserPlusIcon className="size-6 md:size-8" />
                  {t('heading')}
                </>
              ) : (
                <>
                  <KeyIcon className="size-6 md:size-8" />
                  {t('verifyHeading')}
                </>
              )}
            </h2>
            <p className="text-sm md:text-md">
              {step === 1
                ? t('subheading')
                : `We sent a verification code to ${email}`}
            </p>
          </div>
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-full px-6 block md:hidden">
            <Separator orientation="horizontal"/>
          </div>
          <div className="w-full flex flex-col p-4 pt-2 md:p-12">
            {step === 1 ? (
              // Step 1: Account Information
              <>
                <div className="space-y-4 w-full p-2 md:p-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                      {message}
                    </div>
                  )}

                  {/* OAuth Sign-Up Buttons */}
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

                <form onSubmit={handleSignup} className="space-y-4 w-full p-2 md:p-4">
                  <div>
                    <label htmlFor="email" className="block font-medium mb-1">
                      {t('emailLabel')}
                    </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('emailPlaceholder')}
                    className="w-full"
                  />
                </div>

                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <label htmlFor="firstName" className="block font-medium mb-1">
                      {t('firstNameLabel')}
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder={t('firstNamePlaceholder')}
                      className="w-full"
                    />
                  </div>

                  <div className='flex-1'>
                    <label htmlFor="lastName" className="block font-medium mb-1">
                      {t('lastNameLabel')}
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder={t('lastNamePlaceholder')}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block font-medium mb-1">
                    {t('passwordLabel')}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={t('passwordPlaceholder')}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block font-medium mb-1">
                    {t('confirmPasswordLabel')}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder={t('confirmPasswordPlaceholder')}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      {t('buttonLoading')}
                    </>
                  ) : (
                    t('button')
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {t('haveAccount', { default: 'Already have an account?' })}{' '}
                    <TransitionLink href="/login" className="text-primary underline font-medium">
                      {t('signIn')}
                    </TransitionLink>
                  </span>
                </div>
              </form>
            </>
            ) : (
              // Step 2: Verification Code
              <form onSubmit={handleVerifyCode} className="space-y-4 w-full p-2 md:p-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    {message}
                  </div>
                )}

                <div>
                  <label htmlFor="code" className="block font-medium mb-1">
                    {t('verificationCodeLabel')}
                  </label>
                  <Input
                    id="code"
                    type="text"
                    name="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder={t('verificationCodePlaceholder')}
                    className="w-full text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      {t('verifyButtonLoading')}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {t('verifyButton')}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="text-sm"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    {tCommon('back')}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm"
                  >
                    {resendCooldown > 0
                      ? t('resendIn', { seconds: resendCooldown })
                      : t('resendCode')}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {t('codeNotReceived')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
