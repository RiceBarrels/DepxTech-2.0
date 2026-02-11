'use client'

import { DollarSign, Truck, Clock, Shield } from 'lucide-react'

const indicators = [
  { icon: DollarSign, label: 'Best Price', value: 'Guaranteed' },
  { icon: Truck, label: 'Free Shipping', value: 'Included' },
  { icon: Clock, label: 'Fast Payment', value: '24 Hours' },
  { icon: Shield, label: 'Data Wiped', value: 'Certified' },
]

export function TradeTrustIndicators() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {indicators.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TradeValueProposition() {
  return (
    <div className="rounded-2xl bg-slate-900 dark:bg-slate-800 p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">Why Trade With Us?</h3>
          <p className="text-slate-400 text-sm">
            Join thousands of customers who've traded devices for top dollar. Fast, secure, hassle-free.
          </p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">50K+</div>
            <div className="text-xs text-slate-400">Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">4.9★</div>
            <div className="text-xs text-slate-400">Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}
