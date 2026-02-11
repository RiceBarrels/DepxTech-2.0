'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/trade?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-xl group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
        <Search className="w-5 h-5" />
      </div>
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for your device (e.g. iPhone 15 Pro)"
        className="w-full pl-12 pr-32 py-6 h-auto bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-lg text-base"
      />
      <Button
        type="submit"
        className="absolute right-2 top-2 bottom-2 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg"
      >
        Get Quote
      </Button>
    </form>
  )
}
