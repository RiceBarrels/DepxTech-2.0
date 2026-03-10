import Image from 'next/image'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import TradeSearch from '@/components/trade/TradeSearch'
import { Leaf, BadgeCheck, DollarSign } from 'lucide-react'
import { FlipWords } from '../ui/flip-words'
import { getTranslations } from 'next-intl/server'

export async function HomeHero() {
  const t = await getTranslations('home.hero')
  return (
    <section className="relative h-full overflow-hidden bg-violet-50 dark:bg-[#07070f]">

      {/* Orbs — light (hidden on mobile for performance) */}
      <div className="dark:hidden absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[130px]" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)' }} />
      </div>
      {/* Orbs — dark (hidden on mobile for performance) */}
      <div className="absolute inset-0 pointer-events-none hidden dark:sm:block">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[130px]" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
      </div>

      {/* Grid texture (hidden on mobile for performance) */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.03] pointer-events-none hidden sm:block"
        style={{ backgroundImage: 'linear-gradient(rgba(109,40,217,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full py-10 lg:py-0">

          {/* Left */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit border border-emerald-300 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
              {t('badge')}
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight">
              <TextGenerateEffect
                words={t('headline1')}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight"
                filter={false}
                duration={0.3}
              />
              <span className="text-slate-900 dark:text-white">
                <FlipWords words={t.raw('flipWords')} className="text-violet-600 dark:text-violet-400" />
                {t('headline2')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-slate-600 dark:text-slate-400 text-base max-w-md leading-relaxed">
              {t('subheadline')}
            </p>

            {/* Search */}
            <TradeSearch variant="hero" />

            {/* Trust */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <BadgeCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                {t('trustScore')}
              </span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="font-medium text-slate-600 dark:text-slate-400">{t('devicesRecycled')}</span>
            </div>
          </div>

          {/* Right — Image card (desktop only) */}
          <div className="relative hidden lg:block">
            {/* Glow — dark only */}
            <div className="hidden dark:block absolute inset-0 rounded-[2rem] blur-2xl opacity-30" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(79,70,229,0.4))' }} />

            {/* Card */}
            <div className="relative rounded-[2rem] p-6 border bg-white dark:bg-white/[0.03] border-violet-100 dark:border-violet-500/20 shadow-xl shadow-violet-100/50 dark:shadow-none">
              <div className="aspect-square w-full rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <Image
                  src="/stockImg/iphone_17_pro_max.png"
                  alt={t('imageAlt')}
                  width={280}
                  height={280}
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>

              {/* Floating payout card */}
              <div className="absolute -bottom-5 -left-5 p-4 rounded-xl border bg-white dark:bg-[rgba(10,10,20,0.9)] border-violet-100 dark:border-violet-500/25 shadow-lg shadow-violet-100/40 dark:shadow-none">
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">{t('averagePayoutLabel')}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{t('averagePayoutValue')}</p>
                  </div>
                </div>
              </div>

              {/* Decorative corner dots */}
              <div className="absolute top-4 right-4 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-200 dark:bg-violet-500/40" />
                <span className="w-2 h-2 rounded-full bg-indigo-200 dark:bg-indigo-500/30" />
                <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700/60" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
