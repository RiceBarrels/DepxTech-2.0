import Image from 'next/image'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import HeroSearchTabs from '@/components/home/HeroSearchTabs'
import { Leaf, BadgeCheck, DollarSign, SmartphoneIcon, LaptopIcon, TabletIcon, GamepadIcon, HeadphonesIcon, WatchIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { FlipWords } from '../ui/flip-words'
import { getTranslations } from 'next-intl/server'
import { GSAPStagger, GSAPReveal } from '@/components/ui/scroll-animation-gsap'

export async function HomeHero() {
  const t = await getTranslations('home.hero')
  return (
    <section className="relative min-h-full bg-violet-50 dark:bg-[#07070f]">
      {/* Content */}
      <div className="relative z-10 min-h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full py-10 lg:py-0">

          {/* Left */}
          <GSAPStagger staggerChildren={0.11} className="flex flex-col gap-4 sm:gap-5" from="bottom">
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

            {/* Search Tabs */}
            <div>
              <HeroSearchTabs />
            </div>

            {/* Category Quick-Links */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center font-medium tracking-wide">— Or browse by —</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/trade?category=smartphones", icon: SmartphoneIcon, label: "Phones" },
                  { href: "/trade?category=laptops", icon: LaptopIcon, label: "Laptops" },
                  { href: "/trade?category=tablets", icon: TabletIcon, label: "Tablets" },
                  { href: "/trade?category=gaming", icon: GamepadIcon, label: "Gaming" },
                  { href: "/trade?category=audio", icon: HeadphonesIcon, label: "Audio" },
                  { href: "/trade?category=wearables", icon: WatchIcon, label: "Wearables" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <Icon className="size-3" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <BadgeCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                {t('trustScore')}
              </span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="font-medium text-slate-600 dark:text-slate-400">{t('devicesRecycled')}</span>
            </div>
          </GSAPStagger>

          {/* Right — Image card (desktop only) */}
          <GSAPReveal from="right" delay={0.15} className="relative hidden lg:block">
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
            </div>
          </GSAPReveal>

        </div>
      </div>
    </section>
  )
}
