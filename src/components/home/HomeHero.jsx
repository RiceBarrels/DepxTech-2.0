import Image from 'next/image'
import HeroSearchTabs from '@/components/home/HeroSearchTabs'
import { SmartphoneIcon, LaptopIcon, TabletIcon, GamepadIcon, HeadphonesIcon, WatchIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export async function HomeHero() {
  const t = await getTranslations('home.hero')
  const flipWords = t.raw('flipWords')
  const primaryAction = Array.isArray(flipWords) ? flipWords[0] : 'Trade'
  return (
    <section className="relative min-h-full bg-violet-50 dark:bg-[#07070f]">
      <div className="relative z-10 min-h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center w-full py-10 lg:py-0">

          {/* Left */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Headline — plain, confident typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              {t('headline1')} <span className="text-violet-600 dark:text-violet-400">{primaryAction}</span>{' '}
              {t('headline2').trim()}.
            </h1>

            {/* Subheadline */}
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed">
              {t('subheadline')}
            </p>

            {/* Search Tabs */}
            <HeroSearchTabs />

            {/* Category Quick-Links */}
            <div className="flex flex-col gap-2.5 mt-1">
              <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">Or browse by category</p>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
              <span>{t('trustScore')}</span>
              <span className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
              <span>{t('devicesRecycled')}</span>
            </div>
          </div>

          {/* Right — product photo (desktop only), no card/floating payout template */}
          <div className="relative hidden lg:flex items-center justify-center">
            <Image
              src="/stockImg/iphone_17_pro_max.png"
              alt={t('imageAlt')}
              width={420}
              height={420}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  )
}
