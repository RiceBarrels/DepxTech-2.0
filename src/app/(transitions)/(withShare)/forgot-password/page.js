'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { ArrowLeftIcon, MailIcon } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useTransitionRouter()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/callback?next=/reset-password`
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a password reset link!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">
      <div className='flex-1 flex flex-col justify-center items-center max-w-256 w-full'>
        <div className="flex flex-col md:flex-row w-full md:h-100 items-center m-8 border rounded-4xl">
          <div className="w-full flex flex-col md:h-100 p-12 pb-8 md:p-12 gap-5">
            <h1 className="text-2xl font-black">DepxTech</h1>
            <h2 className="text-4xl font-bold flex items-center gap-4">
              <MailIcon className="size-8" />
              Reset Password
            </h2>
            <p className="text-md">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-72 block md:hidden">
            <Separator orientation="horizontal" className="w-72"/>
          </div>
          <div className="w-full flex flex-col p-8 pt-6 md:p-12">
            <form onSubmit={handleResetPassword} className="space-y-4 w-full p-4">
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

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || !!message}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : message ? 'Email Sent!' : 'Send Reset Link'}
                </Button>
                
                <TransitionLink href="/login">
                  <Button type="button" variant="outline">
                    <ArrowLeftIcon className="size-4 mr-2" />
                    Back to Login
                  </Button>
                </TransitionLink>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <TransitionLink href="/login" className="text-primary underline">
                    Sign in
                  </TransitionLink>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
