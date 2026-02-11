'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon, LogInIcon } from 'lucide-react'
import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useTransitionRouter()

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
      } else {
        await router.push('/')
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
        <div className="flex flex-col md:flex-row w-full md:h-100 items-center m-4 md:m-8 border rounded-2xl md:rounded-4xl">
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
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-full px-6 block md:hidden">
            <Separator orientation="horizontal"/>
          </div>
          <div className="w-full flex flex-col p-4 pt-2 md:p-12">
            <form onSubmit={handleLogin} className="space-y-4 w-full p-2 md:p-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
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
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="w-full"
                />
              </div>

              <div>
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

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? t('buttonLoading') : t('button')}
                </Button>
                
                <TransitionLink href="/signup">
                  <Button type="button" variant="outline">
                    {t('createAccount')}
                  </Button>
                </TransitionLink>
              </div>

              <div className="text-center">
                <TransitionLink href="/forgot-password" className="text-sm text-primary underline">
                  {t('forgotPassword')}
                </TransitionLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}