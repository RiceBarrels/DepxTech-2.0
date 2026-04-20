import { Link } from '@/i18n/navigation'
import { Leaf, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function TradeEnvironmentalImpact() {
  const t = await getTranslations('trade.environmentalImpact')

  const devices = [
    {
      name: t('smartphone'),
      co2: t('smartphoneCO2'),
      water: t('smartphoneWater'),
      minerals: t('smartphoneMinerals'),
    },
    {
      name: t('laptop'),
      co2: t('laptopCO2'),
      water: t('laptopWater'),
      minerals: t('laptopMinerals'),
    },
    {
      name: t('tablet'),
      co2: t('tabletCO2'),
      water: t('tabletWater'),
      minerals: t('tabletMinerals'),
    },
  ]

  return (
    <section className="w-full bg-foreground text-background">
      <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <Leaf className="size-3" />
              {t('heading')}
            </div>
            <p className="text-background/70 text-base sm:text-lg leading-relaxed mb-6">
              {t('subheading')}
            </p>
            <Link
              href="/trade/browse"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-600 transition-colors text-sm"
            >
              {t('ctaText')} <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Right: Impact Cards */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-background/50 px-4">
              <div />
              <div className="text-center">{t('co2Label')}</div>
              <div className="flex justify-between">
                <span className="w-1/2 text-center">{t('waterLabel')}</span>
                <span className="w-1/2 text-center">{t('mineralsLabel')}</span>
              </div>
            </div>
            {devices.map((device) => (
              <div key={device.name} className="bg-background/10 rounded-xl p-4">
                <p className="font-bold text-sm mb-2">{device.name}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-background/50 text-xs">CO₂</p>
                    <p className="text-emerald-400 font-semibold">{device.co2}</p>
                  </div>
                  <div>
                    <p className="text-background/50 text-xs">Water</p>
                    <p className="text-emerald-400 font-semibold">{device.water}</p>
                  </div>
                  <div>
                    <p className="text-background/50 text-xs">Minerals</p>
                    <p className="text-emerald-400 font-semibold">{device.minerals}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
