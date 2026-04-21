"use client"

import { useState } from 'react'
import TradeSearch from '@/components/trade/TradeSearch'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { ArrowRightLeftIcon, ShoppingBagIcon, SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HeroSearchTabs() {
    const router = useTransitionRouter()
    const [activeTab, setActiveTab] = useState('trade')
    const [shopQuery, setShopQuery] = useState('')

    const handleShopSubmit = (e) => {
        e.preventDefault()
        if (shopQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(shopQuery.trim())}`)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] w-fit">
                <button
                    onClick={() => setActiveTab('trade')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                        activeTab === 'trade'
                            ? "bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    <ArrowRightLeftIcon className="size-4" />
                    Trade In Your Device
                </button>
                <button
                    onClick={() => setActiveTab('shop')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                        activeTab === 'shop'
                            ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    <ShoppingBagIcon className="size-4" />
                    Shop Products
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'trade' ? (
                <TradeSearch variant="hero" />
            ) : (
                <form onSubmit={handleShopSubmit} className="relative">
                    <div className="relative flex items-center bg-background rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 focus-within:border-emerald-400 dark:focus-within:border-emerald-500/50 transition-colors">
                        <div className="absolute left-5 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            value={shopQuery}
                            onChange={(e) => setShopQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full h-16 text-lg pl-14 pr-24 bg-transparent border-none outline-none focus:ring-0 text-foreground"
                        />
                        {shopQuery && (
                            <button
                                type="submit"
                                className="absolute right-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                            >
                                Search
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    )
}
