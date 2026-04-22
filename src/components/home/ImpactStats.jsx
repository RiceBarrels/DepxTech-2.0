import { Leaf, Recycle, Droplets, Wind, TreePine } from 'lucide-react'
import { GSAPStagger, GSAPReveal, GSAPCounter } from '@/components/ui/scroll-animation-gsap'
import { getTranslations } from 'next-intl/server'

const statIcons = [Recycle, Wind, Droplets, TreePine]

export async function ImpactStats() {
  const t = await getTranslations('home.impact')

  const stats = [
    { value: 5000, icon: statIcons[0], label: t('stat1Label'), suffix: '+' },
    { value: 12000, icon: statIcons[1], label: t('stat2Label'), suffix: ' kg' },
    { value: 50000, icon: statIcons[2], label: t('stat3Label'), suffix: ' L' },
    { value: 99, icon: statIcons[3], label: t('stat4Label'), suffix: '%' },
  ]

  return (
    <section className="py-20 bg-slate-900 dark:bg-slate-800 text-white relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 pointer-events-none opacity-5">
        <Leaf className="w-48 h-48 sm:w-64 sm:h-64" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <GSAPReveal from="top">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold mb-6">
              <Leaf className="size-4" />
              {t('heading')}
            </div>
          </GSAPReveal>
          <GSAPReveal from="blur" delay={0.1}>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {t('subheading')}
            </p>
          </GSAPReveal>
        </div>

        <GSAPStagger staggerChildren={0.14} delayChildren={0.1} from="bottom" className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="text-center">
                <div className="size-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="size-7 text-emerald-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-2">
                  <GSAPCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            )
          })}
        </GSAPStagger>
      </div>
    </section>
  )
}
