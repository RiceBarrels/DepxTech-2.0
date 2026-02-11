'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useTransitionRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.')
        setIsValidSession(false)
      } else {
        setIsValidSession(true)
      }
    }

    checkSession()
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter')
      setLoading(false)
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      setLoading(false)
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      setLoading(false)
      return
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password)) {
      setError('Password must contain at least one special character')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password updated successfully! Redirecting to login...')
        setTimeout(async () => {
          await router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidSession && error) {
    return (
      <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">
        <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
          <div className="flex flex-col md:flex-row w-full md:h-100 items-center m-4 md:m-8 border rounded-2xl md:rounded-4xl">
            <div className="w-full flex flex-col md:h-100 p-6 pb-4 md:p-12 gap-3 md:gap-5">
              <h1 className="text-xl md:text-2xl font-black">DepxTech</h1>
              <h2 className="text-2xl md:text-4xl font-bold flex items-center gap-3 md:gap-4">
                <LockIcon className="size-6 md:size-8" />
                Reset Password
              </h2>
            </div>
            <div className="h-72 hidden md:block">
              <Separator orientation="vertical" className="h-72"/>
            </div>
            <div className="w-full px-6 block md:hidden">
              <Separator orientation="horizontal"/>
            </div>
            <div className="w-full flex flex-col p-4 pt-2 md:p-12">
              <div className="space-y-4 w-full p-2 md:p-4">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
                <TransitionLink href="/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </TransitionLink>
                <div className="text-center">
                  <TransitionLink href="/login" className="text-sm text-primary underline">
                    Back to Login
                  </TransitionLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">
      <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
        <div className="flex flex-col md:flex-row w-full md:h-100 items-center m-4 md:m-8 border rounded-2xl md:rounded-4xl">
          <div className="w-full flex flex-col md:h-100 p-6 pb-4 md:p-12 gap-3 md:gap-5">
            <h1 className="text-xl md:text-2xl font-black">DepxTech</h1>
            <h2 className="text-2xl md:text-4xl font-bold flex items-center gap-3 md:gap-4">
              <LockIcon className="size-6 md:size-8" />
              Set New Password
            </h2>
            <p className="text-sm md:text-md">
              Enter your new password below
            </p>
          </div>
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-full px-6 block md:hidden">
            <Separator orientation="horizontal"/>
          </div>
          <div className="w-full flex flex-col p-4 pt-2 md:p-12">
            <form onSubmit={handleResetPassword} className="space-y-4 w-full p-2 md:p-4">
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
                <label htmlFor="password" className="block font-medium mb-1">
                  New Password
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
                    placeholder="Enter your new password"
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
                  Confirm Password
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
                    placeholder="Confirm your new password"
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
                disabled={loading || !!message}
                className="w-full"
              >
                {loading ? 'Updating...' : message ? 'Password Updated!' : 'Update Password'}
              </Button>

              <div className="text-center">
                <TransitionLink href="/login" className="text-sm text-primary underline">
                  Back to Login
                </TransitionLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
