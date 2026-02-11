'use client'

import { Building2, LayoutList, Smartphone, Layers, Package } from 'lucide-react'

const iconMap = {
  building: Building2,
  layout: LayoutList,
  smartphone: Smartphone,
  layers: Layers,
  package: Package,
}

export function TradeEmptyState({ icon = 'package', message }) {
  const Icon = iconMap[icon] || Package

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500 text-lg">{message}</p>
    </div>
  )
}
