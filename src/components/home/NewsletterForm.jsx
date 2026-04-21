'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useWebHaptics } from 'web-haptics/react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { trigger } = useWebHaptics()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    trigger('success')
    toast.success('Successfully subscribed!', {
      description: 'You\'ll receive trade-in price updates in your inbox.',
    })

    setEmail('')
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto relative z-10">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        aria-label="Email address for newsletter"
        required
        className="flex-1 bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl focus:ring-primary focus:border-primary transition-all"
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 rounded-xl transition-all"
      >
        {isLoading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
