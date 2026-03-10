import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import {
  BookOpen,
  Repeat,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  UserCog,
  ArrowRight,
  MessageCircle,
  Mail,
} from 'lucide-react'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const { buildPageMeta } = await import('@/lib/seo')
  return buildPageMeta(locale, {
    titleKey: 'title',
    descKey: 'metaDescription',
    path: '/help',
    namespace: 'help',
  })
}

export default async function HelpPage() {
  const t = await getTranslations('help')

  const topics = [
    { Icon: Repeat, title: t('tradeIn'), description: t('tradeInDesc'), href: '/trade/faq' },
    { Icon: CreditCard, title: t('orders'), description: t('ordersDesc'), href: '/account/orders' },
    { Icon: Truck, title: t('shipping'), description: t('shippingDesc'), href: '/shipping' },
    { Icon: RotateCcw, title: t('returns'), description: t('returnsDesc'), href: '/returns' },
    { Icon: Shield, title: t('warranty'), description: t('warrantyDesc'), href: '/warranty' },
    { Icon: UserCog, title: t('account'), description: t('accountDesc'), href: '/account/settings' },
  ]

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {t('heading').split(t('headingHighlight'))[0]}
              <span className="text-primary">{t('headingHighlight')}</span>
              {t('heading').split(t('headingHighlight'))[1]}
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {t('popularTopics')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {topics.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="group flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <topic.Icon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                  {topic.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-4">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('stillNeedHelp')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              {t('stillNeedHelpDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="size-4" />
                {t('contactSupport')}
              </Link>
              <a
                href="mailto:support@depxtech.com"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Mail className="size-4" />
                {t('emailSupport')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
