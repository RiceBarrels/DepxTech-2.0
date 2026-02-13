'use client'

import Image from 'next/image'

export default function TradeBrandCard({ name, img, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      {...props}
      className="group flex flex-col items-center rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 p-4 sm:p-6 gap-3 w-full"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center">
        {img ? (
          <Image
            src={img}
            alt={name}
            width={80}
            height={80}
            className="object-contain group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
            <span className="text-xl font-bold text-muted-foreground">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors text-center">
        {name}
      </span>
    </button>
  )
}
