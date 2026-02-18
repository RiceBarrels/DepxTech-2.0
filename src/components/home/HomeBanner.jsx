import Link from 'next/link'
import { BannerControls } from './BannerControls'
import { HomeHero } from './HomeHero'

// ── Add or remove slides here ──────────────────────────
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
      className="flex-none w-full h-full snap-center relative overflow-hidden bg-violet-50 dark:bg-[#07070f]"
    >
      {/* Orbs — light */}
      <div className="dark:hidden absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)' }} />
      </div>
      {/* Orbs — dark */}
      <div className="hidden dark:block absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-16 w-72 h-72 rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(109,40,217,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      {/* Concentric rings */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 hidden md:block">
        <div className="w-[420px] h-[420px] rounded-full border border-violet-300/40 dark:border-violet-500/10" />
        <div className="absolute inset-8 rounded-full border border-violet-300/30 dark:border-violet-500/10" />
        <div className="absolute inset-16 rounded-full border border-violet-400/30 dark:border-violet-400/15" />
        <div className="absolute inset-24 rounded-full border border-violet-500/25 dark:border-violet-400/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          {/* Label */}
          <div className="flex items-center gap-3 mb-5 sm:mb-7">
            <div className="w-8 h-px bg-violet-400 dark:bg-violet-500/60" />
            <span className="text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-[0.2em]">Trade-in Program</span>
          </div>

          {/* Headline — light */}
          <h2 className="dark:hidden text-5xl sm:text-6xl md:text-7xl font-black leading-[0.88] tracking-tighter text-violet-950 mb-5 sm:mb-7">
            Trade Your<br />Old Device
          </h2>
          {/* Headline — dark */}
          <h2
            className="hidden dark:block text-5xl sm:text-6xl md:text-7xl font-black leading-[0.88] tracking-tighter mb-5 sm:mb-7"
            style={{ background: 'linear-gradient(140deg, #fff 20%, #a78bfa 60%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Trade Your<br />Old Device
          </h2>

          {/* Description */}
          <p className="text-violet-900/60 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-7 sm:mb-9 max-w-sm">
            Get the best value for your used electronics.<br className="hidden sm:block" />Fast, free shipping included.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
            >
              Get a Quote →
            </div>
            <div className="flex items-center gap-3 text-xs text-violet-700/50 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Instant payout
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Free shipping
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  ),

  /* ── Slide: Shop ── */
  (
    <Link
      href="/products"
      className="flex-none w-full h-full snap-center relative overflow-hidden bg-emerald-50 dark:bg-[#050e09]"
    >
      {/* Orbs — light */}
      <div className="dark:hidden absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[130px] -translate-y-1/4 translate-x-1/4" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)' }} />
      </div>
      {/* Orbs — dark */}
      <div className="hidden dark:block absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[130px] -translate-y-1/4 translate-x-1/4" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)' }} />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.28] dark:opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(5,150,105,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* Watermark "NEW" */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 font-black leading-none select-none hidden lg:block text-emerald-200 dark:text-[rgba(16,185,129,0.04)]"
        style={{ fontSize: '18rem', letterSpacing: '-0.05em', lineHeight: 1 }}
      >
        NEW
      </div>

      {/* Accent line */}
      <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-emerald-300/50 to-transparent dark:from-emerald-500/20" />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-5 sm:mb-7">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              New Arrivals
            </span>
          </div>

          {/* Headline — light */}
          <h2 className="dark:hidden text-5xl sm:text-6xl md:text-7xl font-black leading-[0.88] tracking-tighter text-emerald-950 mb-5 sm:mb-7">
            Shop<br />
            <span className="text-emerald-600">Refurbished</span>
            <br />Tech
          </h2>
          {/* Headline — dark */}
          <h2 className="hidden dark:block text-5xl sm:text-6xl md:text-7xl font-black leading-[0.88] tracking-tighter mb-5 sm:mb-7 text-white">
            Shop<br />
            <span style={{ background: 'linear-gradient(135deg, #34d399, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Refurbished
            </span>
            <br />Tech
          </h2>

          {/* Description */}
          <p className="text-emerald-900/60 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-7 sm:mb-9 max-w-sm">
            Premium quality, certified devices<br className="hidden sm:block" />at unbeatable prices.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Browse Collection →
            </div>
            <div className="h-4 w-px bg-emerald-200 dark:bg-slate-700" />
            <span className="text-xs text-emerald-800/50 dark:text-slate-500">1,200+ devices in stock</span>
          </div>
        </div>
      </div>
    </Link>
  ),

  /* ── Slide: Offers ── */
  (
    <Link
      href="/offers"
      className="flex-none w-full h-full snap-center relative overflow-hidden bg-amber-50 dark:bg-[#0f0800]"
    >
      {/* Orbs — light */}
      <div className="dark:hidden absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%)' }} />
      </div>
      {/* Orbs — dark */}
      <div className="hidden dark:block absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Diagonal stripes */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 1px, transparent 1px, transparent 12px)' }}
      />

      {/* Watermark "%" */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 font-black select-none hidden lg:block text-amber-200 dark:text-[rgba(245,158,11,0.045)]"
        style={{ fontSize: '24rem', lineHeight: 1, letterSpacing: '-0.05em' }}
      >
        %
      </div>

      {/* Top badge */}
      <div className="absolute top-6 left-8 sm:left-12 lg:left-20 z-10">
        <span
          className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#000' }}
        >
          ⚡ Limited Time
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-8 sm:px-12 lg:px-20">
        <div className="max-w-xl">
          {/* Headline — light */}
          <h2 className="dark:hidden text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter text-amber-950 mb-5 sm:mb-7">
            <span className="text-amber-500">Special</span>
            <br />Offers
          </h2>
          {/* Headline — dark */}
          <h2 className="hidden dark:block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter mb-5 sm:mb-7">
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Special
            </span>
            <br />
            <span className="text-white">Offers</span>
          </h2>

          {/* Description */}
          <p className="text-amber-900/60 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-7 sm:mb-9 max-w-sm">
            {"Don't miss out on our best deals of the season."}<br className="hidden sm:block" />Prices drop every day.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="px-5 py-2.5 rounded-full text-sm font-black"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#000', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
            >
              View All Deals →
            </div>
            <div className="flex flex-col items-center px-4 py-2 rounded-xl min-w-[64px] bg-amber-100 dark:bg-stone-900/60 border border-amber-200 dark:border-stone-700/60">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest leading-tight">Up to</span>
              <span className="text-amber-900 dark:text-white font-black text-2xl leading-none">40%</span>
              <span className="text-amber-500/70 dark:text-stone-500 text-xs uppercase tracking-widest">Off</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  ),
]

export function HomeBanner() {
  return (
    <section className="w-full relative group">
      <div className="relative w-full h-[75dvh] overflow-hidden">
        {/* Scrollable slide container — native CSS scroll-snap */}
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

        {/* Client-side controls: arrows, dots, autoplay */}
        <BannerControls count={slides.length} />
      </div>
    </section>
  )
}
