import Link from 'next/link'
import { BannerControls } from './BannerControls'

// ── Define your slides here ──────────────────────────
const slides = [
  {
    href: '/trade',
    title: 'Trade Your Old Device',
    subtitle: 'Trade-in Program',
    description: 'Get the best value for your used electronics. Fast, free shipping included.',
    gradient: 'bg-linear-to-r from-violet-600 to-indigo-600',
  },
  {
    href: '/products',
    title: 'Shop Refurbished Tech',
    subtitle: 'New Arrivals',
    description: 'Premium quality, certified devices at unbeatable prices.',
    gradient: 'bg-linear-to-r from-emerald-600 to-teal-600',
  },
  {
    href: '/offers',
    title: 'Special Offers',
    subtitle: 'Limited Time',
    description: "Don't miss out on our best deals of the season.",
    gradient: 'bg-linear-to-r from-amber-500 to-orange-600',
  },
]

export function HomeBanner() {
  return (
    <section className="w-full relative group">
      <div className="relative w-full h-[60dvh] overflow-hidden">
        {/* Scrollable slide container — native CSS scroll-snap */}
        <div
          id="banner-scroller"
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {slides.map((slide, i) => (
            <Link
              key={i}
              href={slide.href}
              className={`flex-none w-full h-full snap-center ${slide.gradient}`}
            >
              <div className="flex items-center justify-center h-full text-white px-6">
                <div className="text-center max-w-2xl">
                  <p className="text-xs sm:text-sm font-medium uppercase tracking-wider opacity-80 mb-1 sm:mb-2">
                    {slide.subtitle}
                  </p>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-xs sm:text-sm opacity-80 hidden sm:block">
                    {slide.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Client-side controls: arrows, dots, autoplay */}
        <BannerControls count={slides.length} />
      </div>
    </section>
  )
}
