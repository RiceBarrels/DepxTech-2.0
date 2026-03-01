import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ScrollStagger, ScrollReveal, ScrollCounter, ScrollScale, ScrollParallax, ScrollFade } from '@/components/ui/scroll-animation'
import { MacbookScroll } from '@/components/ui/macbook-scroll'
import {
  Sparkles,
  Leaf,
  Eye,
  Zap,
  ShieldCheck,
  ArrowRight,
  Users,
  Recycle,
  Clock,
  TrendingUp,
} from 'lucide-react'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    openGraph: { title: t('aboutTitle'), description: t('aboutDescription'), type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function AboutPage() {
  const t = await getTranslations('about')

  const stats = [
    { Icon: Recycle, value: 5000, suffix: '+', label: t('stat1Label') },
    { Icon: Users, value: 3000, suffix: '+', label: t('stat2Label') },
    { Icon: Leaf, value: 12000, suffix: ' kg', label: t('stat3Label') },
    { Icon: Clock, value: 24, suffix: 'h', label: t('stat4Label') },
  ]

  const values = [
    { Icon: Leaf, title: t('value1Title'), desc: t('value1Desc'), color: 'emerald', anim: 'left' },
    { Icon: Eye, title: t('value2Title'), desc: t('value2Desc'), color: 'blue', anim: 'right' },
    { Icon: Zap, title: t('value3Title'), desc: t('value3Desc'), color: 'amber', anim: 'left' },
    { Icon: ShieldCheck, title: t('value4Title'), desc: t('value4Desc'), color: 'purple', anim: 'right' },
  ]

  const colorMap = {
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-500' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-500' },
  }

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-primary/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollStagger staggerChildren={0.15} className="text-center max-w-3xl mx-auto">
            <ScrollReveal animation="top">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Sparkles className="size-4" />
                {t('badge')}
              </div>
            </ScrollReveal>
            <ScrollReveal animation="blur">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
                {t('heading')}
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="blur">
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {t('subheading')}
              </p>
            </ScrollReveal>
          </ScrollStagger>
        </div>
      </section>

      {/* MacBook Scroll Showcase */}
      <div className="w-full overflow-hidden bg-background dark:bg-[#0B0B0F]">
        <MacbookScroll
          title={
            <span className="text-foreground">
              {t('heading')}
            </span>
          }
          src="/stockImg/Frame 1.png"
          showGradient={false}
        />
      </div>

      {/* Our Story — staggered paragraph reveals */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollScale>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              {t('storyTitle')}
            </h2>
          </ScrollScale>

          <div className="max-w-3xl mx-auto space-y-8">
            <ScrollFade animation="left" delay={0}>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg border-l-4 border-primary/30 pl-6">
                {t('storyP1')}
              </p>
            </ScrollFade>
            <ScrollFade animation="right" delay={0.1}>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg border-l-4 border-emerald-500/30 pl-6">
                {t('storyP2')}
              </p>
            </ScrollFade>
            <ScrollFade animation="left" delay={0.2}>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg border-l-4 border-amber-500/30 pl-6">
                {t('storyP3')}
              </p>
            </ScrollFade>
          </div>
        </div>
      </section>

      {/* Stats — scale in with parallax */}
      <section className="py-20 bg-foreground text-background relative overflow-hidden">
        <ScrollParallax speed={0.3} className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/5 blur-3xl" />
        <ScrollParallax speed={-0.2} className="absolute -bottom-20 -left-20 size-60 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollStagger staggerChildren={0.2} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <ScrollScale key={stat.label}>
                <div className="text-center p-4 sm:p-6 bg-background/10 rounded-2xl backdrop-blur-sm">
                  <div className="size-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.Icon className="size-7 text-primary" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold mb-1">
                    <ScrollCounter value={stat.value} suffix={stat.suffix} duration={2} />
                  </div>
                  <p className="text-sm text-background/60">{stat.label}</p>
                </div>
              </ScrollScale>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* Our Values — alternating left/right reveals */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollScale>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('valuesTitle')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('valuesSubtitle')}
              </p>
            </div>
          </ScrollScale>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} animation={v.anim} delay={i * 0.08}>
                <div className="flex gap-3 sm:gap-4 p-5 sm:p-7 bg-card rounded-2xl border border-border h-full hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className={`size-14 ${colorMap[v.color].bg} rounded-2xl flex items-center justify-center`}>
                      <v.Icon className={`size-7 ${colorMap[v.color].text}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
                    <p className="text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How We're Different — scale reveal cards */}
      <section className="py-16 lg:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollParallax speed={0.2}>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('diffTitle')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('diffSubtitle')}
              </p>
            </div>
          </ScrollParallax>

          <ScrollStagger staggerChildren={0.15} className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: TrendingUp, title: t('diff1Title'), desc: t('diff1Desc') },
              { icon: Recycle, title: t('diff2Title'), desc: t('diff2Desc') },
              { icon: Users, title: t('diff3Title'), desc: t('diff3Desc') },
            ].map((item) => (
              <ScrollReveal key={item.title} animation="z">
                <div className="text-center p-6 sm:p-8 bg-background rounded-2xl border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
                  <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="size-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* CTA — scale in */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollScale>
            <div className="bg-primary rounded-3xl p-6 sm:p-8 lg:p-14 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 size-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <Sparkles className="size-12 text-primary-foreground mx-auto mb-4" />
                <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                  {t('ctaTitle')}
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                  {t('ctaDesc')}
                </p>
                <Link
                  href="/trade"
                  className="inline-flex items-center gap-2 bg-background text-foreground font-bold py-4 px-8 rounded-xl hover:bg-background/90 transition-colors"
                >
                  {t('ctaButton')} <ArrowRight className="size-5" />
                </Link>
              </div>
            </div>
          </ScrollScale>
        </div>
      </section>
    </main>
  )
}
