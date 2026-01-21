'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { ArrowLeftIcon, MailIcon, KeyIcon, CheckCircleIcon, Loader2Icon } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? 'Enter your details to create a new account'
                : `Enter the 6-digit code sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              // Step 1: Account Information
              <form onSubmit={handleSignup} className="space-y-4">
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
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
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
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">
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
                      placeholder="Enter your first name"
                      className="w-full"
                    />
                  </div>

                  <div className='flex-1'>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">
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
                      placeholder="Enter your last name"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
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
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <MailIcon className="w-4 h-4 mr-2" />
                      Continue
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TransitionLink href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Sign in
                    </TransitionLink>
                  </p>
                </div>
              </form>
            ) : (
              // Step 2: Verification Code
              <form onSubmit={handleVerifyCode} className="space-y-4">
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

                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <KeyIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    We sent a verification code to
                  </p>
                  <p className="font-medium">{email}</p>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-1">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
