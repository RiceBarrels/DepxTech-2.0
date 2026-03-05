'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { ArrowLeftIcon, MailIcon, KeyIcon, LockIcon, CheckCircleIcon, Loader2Icon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useWebHaptics } from 'web-haptics/react'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword')
  const tSignup = useTranslations('auth.signup')
  const tCommon = useTranslations('common')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1) // 1: email, 2: verify code, 3: new password
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useTransitionRouter()
  const { trigger } = useWebHaptics()

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

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()

      // Send OTP for password recovery
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Don't create new user, only for existing users
        }
      })

      if (error) {
        trigger('error')
        if (error.message.includes('User not found') || error.message.includes('Invalid login credentials')) {
          setError(t('noAccount'))
        } else {
          setError(error.message)
        }
      } else {
        trigger('success')
        setMessage(t('codeSent'))
        setStep(2)
        startCooldown()
      }
    } catch (err) {
      setError(tCommon('unexpectedError'))
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
      setError(t('verificationCodePlaceholder'))
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
        trigger('error')
        setError(error.message)
      } else {
        trigger('success')
        setMessage(t('codeVerified'))
        setStep(3)
      }
    } catch (err) {
      setError(tCommon('unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError(tSignup('passwordMismatch'))
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError(tSignup('passwordTooShort'))
      setLoading(false)
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError(tSignup('passwordNoLowercase'))
      setLoading(false)
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError(tSignup('passwordNoUppercase'))
      setLoading(false)
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError(tSignup('passwordNoNumber'))
      setLoading(false)
      return
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(newPassword)) {
      setError(tSignup('passwordNoSpecial'))
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        trigger('error')
        setError(error.message)
      } else {
        trigger('success')
        setMessage(t('passwordUpdated'))
        setTimeout(async () => {
          await router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError(tCommon('unexpectedError'))
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
        trigger('error')
        setError(error.message)
      } else {
        trigger('success')
        setMessage(t('newCodeSent'))
        startCooldown()
      }
    } catch (err) {
      setError(tCommon('unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setVerificationCode('')
    } else if (step === 3) {
      setStep(2)
      setNewPassword('')
      setConfirmPassword('')
    }
    setError('')
    setMessage('')
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendCode} className="space-y-4 w-full p-2 md:p-4">
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

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    {t('sendButtonLoading')}
                  </>
                ) : (
                  <>
                    <MailIcon className="w-4 h-4 mr-2" />
                    {t('sendButton')}
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('rememberPassword')}
                <TransitionLink href="/login" className="text-primary underline">
                  {tCommon('signIn')}
                </TransitionLink>
              </p>
            </div>
          </form>
        )

      case 2:
        return (
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

            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <KeyIcon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('step2Desc')}
              </p>
              <p className="font-medium">{email}</p>
            </div>

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
          </form>
        )

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4 w-full p-2 md:p-4">
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

            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <LockIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('codeVerified')}
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block font-medium mb-1">
                {t('newPasswordLabel')}
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder={t('newPasswordPlaceholder')}
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </Button>
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
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </Button>
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
                  {t('updateButtonLoading')}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {t('updateButton')}
                </>
              )}
            </Button>

            <div className="flex items-center justify-start">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="text-sm"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                {tCommon('back')}
              </Button>
            </div>
          </form>
        )
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return t('step1Title')
      case 2:
        return t('step2Title')
      case 3:
        return t('step3Title')
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return t('step1Desc')
      case 2:
        return t('step2Desc')
      case 3:
        return t('step3Desc')
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return <MailIcon className="size-6 md:size-8" />
      case 2:
        return <KeyIcon className="size-6 md:size-8" />
      case 3:
        return <LockIcon className="size-6 md:size-8" />
    }
  }

  return (
    <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">
      <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
        <div className="flex flex-col md:flex-row w-full md:h-auto items-center m-4 md:m-8 border rounded-2xl md:rounded-4xl">
          <div className="w-full flex flex-col p-6 pb-4 md:p-12 gap-3 md:gap-5">
            <h1 className="text-xl md:text-2xl font-black">DepxTech</h1>
            <h2 className="text-2xl md:text-4xl font-bold flex items-center gap-3 md:gap-4">
              {getStepIcon()}
              {getStepTitle()}
            </h2>
            <p className="text-sm md:text-md">
              {getStepDescription()}
            </p>
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="h-auto hidden md:block">
            <Separator orientation="vertical" className="h-full min-h-72"/>
          </div>
          <div className="w-full px-6 block md:hidden">
            <Separator orientation="horizontal"/>
          </div>
          <div className="w-full flex flex-col p-4 pt-2 md:p-12">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
