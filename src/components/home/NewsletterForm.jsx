'use client'

import { useState } from 'react'
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
    await new Promise(resolve => setTimeout(resolve, 500))
    trigger('success')
    toast.success('Successfully subscribed!', {
      description: 'You\'ll receive trade-in price updates in your inbox.',
    })

    setEmail('')
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-md border-b border-slate-300 dark:border-slate-700 focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address for newsletter"
        required
        className="flex-1 bg-transparent text-base py-3 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="text-sm font-semibold text-slate-900 dark:text-white py-3 whitespace-nowrap disabled:opacity-50 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
      >
        {isLoading ? 'Subscribing…' : 'Subscribe →'}
      </button>
    </form>
  )
}
