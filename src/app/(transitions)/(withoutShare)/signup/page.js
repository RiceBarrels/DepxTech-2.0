'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { UserPlusIcon, MailIcon, KeyIcon, CheckCircleIcon, Loader2Icon, ArrowLeftIcon } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
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
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
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
        setError('An account with this email already exists. Please login instead.')
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
        setMessage('Account created! Check your email for a verification code.')
      } else {
        setMessage('Verification code sent to your email!')
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

      setMessage('Email verified successfully! Redirecting...')

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
        setMessage('New verification code sent!')
        startCooldown()
      }
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setLoading(false)
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
        <div className="flex flex-col md:flex-row w-full md:min-h-100 items-center m-8 border rounded-4xl">
          <div className="w-full flex flex-col md:min-h-100 p-12 pb-8 md:p-12 gap-5 justify-center">
            <h1 className="text-2xl font-black">DepxTech</h1>
            <h2 className="text-4xl font-bold flex items-center gap-4">
              {step === 1 ? (
                <>
                  <UserPlusIcon className="size-8" />
                  Sign Up
                </>
              ) : (
                <>
                  <KeyIcon className="size-8" />
                  Verify Email
                </>
              )}
            </h2>
            <p className="text-md">
              {step === 1
                ? 'Create an account to track your orders, save your wishlist, and get personalized recommendations'
                : `We sent a verification code to ${email}`}
            </p>
          </div>
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-72 block md:hidden">
            <Separator orientation="horizontal" className="w-72"/>
          </div>
          <div className="w-full flex flex-col p-8 pt-6 md:p-12">
            {step === 1 ? (
              // Step 1: Account Information
              <form onSubmit={handleSignup} className="space-y-4 w-full p-4">
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

                <div>
                  <label htmlFor="email" className="block font-medium mb-1">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full"
                  />
                </div>

                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <label htmlFor="firstName" className="block font-medium mb-1">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="First name"
                      className="w-full"
                    />
                  </div>

                  <div className='flex-1'>
                    <label htmlFor="lastName" className="block font-medium mb-1">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Last name"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block font-medium mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <TransitionLink href="/login">
                    <Button type="button" variant="outline">
                      Sign In
                    </Button>
                  </TransitionLink>
                </div>
              </form>
            ) : (
              // Step 2: Verification Code
              <form onSubmit={handleVerifyCode} className="space-y-4 w-full p-4">
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
                    Verification Code
                  </label>
                  <Input
                    id="code"
                    type="text"
                    name="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="Enter 6-digit code"
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
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Verify Email
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
                    Back
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Didn't receive the code? Check your spam folder or click "Resend Code"
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
