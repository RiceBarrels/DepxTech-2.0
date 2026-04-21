import { TransitionLink as Link } from '@/components/ui/pageTransitions'
import { BannerControls } from './BannerControls'
import { HomeHero } from './HomeHero'

const slides = [
  (
    <div className="flex-none w-full h-full snap-center overflow-y-auto">
      <HomeHero />
    </div>
  ),

  /* ── Slide: Trade-in ── */
  (
    <Link
      href="/trade"
      className="flex-none w-full h-full snap-center relative overflow-hidden bg-violet-50 dark:bg-[#0a0a14]"
    >
      <div className="relative z-10 flex items-center h-full px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          <p className="text-violet-700 dark:text-violet-400 text-xs font-medium uppercase tracking-widest mb-4">
            Trade-in Program
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-5">
            Trade your<br />old device.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6 max-w-sm">
            Get the best value for your used electronics. Free shipping, instant payout.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 dark:text-violet-400 border-b border-violet-700/40 dark:border-violet-400/40 pb-0.5 hover:border-violet-700 dark:hover:border-violet-400 transition-colors">
            Get a quote →
          </span>
        </div>
      </div>
    </Link>
  ),

  /* ── Slide: Shop ── */
  (
    <Link
      href="/products"
      className="flex-none w-full h-full snap-center relative overflow-hidden bg-emerald-50 dark:bg-[#07120c]"
    >
      <div className="relative z-10 flex items-center h-full px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          <p className="text-emerald-700 dark:text-emerald-400 text-xs font-medium uppercase tracking-widest mb-4">
            New arrivals
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-5">
            Shop refurbished<br />tech.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6 max-w-sm">
            Premium, certified devices at fair prices. 1,200+ in stock.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400 border-b border-emerald-700/40 dark:border-emerald-400/40 pb-0.5 hover:border-emerald-700 dark:hover:border-emerald-400 transition-colors">
            Browse collection →
          </span>
        </div>
      </div>
    </Link>
  ),

  /* ── Slide: Offers ── */
  (
    <Link
      href="/offers"
      className="flex-none w-full h-full snap-center relative overflow-hidden bg-amber-50 dark:bg-[#12100a]"
    >
      <div className="relative z-10 flex items-center h-full px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          <p className="text-amber-700 dark:text-amber-400 text-xs font-medium uppercase tracking-widest mb-4">
            Limited time
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-5">
            Up to 40% off<br />this season.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6 max-w-sm">
            Prices drop every day. Don&apos;t miss the best deals of the season.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-400 border-b border-amber-700/40 dark:border-amber-400/40 pb-0.5 hover:border-amber-700 dark:hover:border-amber-400 transition-colors">
            View all deals →
          </span>
        </div>
      </div>
    </Link>
  ),
]

export function HomeBanner() {
  return (
    <section className="w-full justify-center items-center relative group flex">
      <div className="relative w-full max-w-418 md:h-[65dvh] h-[55dvh] overflow-hidden">
        <div
          id="banner-scroller"
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="contents">
              {slide}
            </div>
          ))}
        </div>

        <BannerControls count={slides.length} />
      </div>
    </section>
  )
}
