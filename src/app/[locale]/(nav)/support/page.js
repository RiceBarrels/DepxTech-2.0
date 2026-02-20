import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import {
  MessageCircle,
  Mail,
  HelpCircle,
  BookOpen,
  Clock,
  Zap,
  ArrowRight,
  Package,
  Repeat,
  Truck,
  RotateCcw,
  Shield,
} from 'lucide-react'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'support' })
  return {
    title: t('title'),
    description: t('metaDescription'),
  }
}

export default async function SupportPage() {
  const t = await getTranslations('support')

  const contactMethods = [
    {
      Icon: MessageCircle,
      title: t('liveChat'),
      description: t('liveChatDesc'),
      action: t('liveChatAction'),
      href: null,
      highlight: true,
    },
    {
      Icon: Mail,
      title: t('emailUs'),
      description: t('emailUsDesc'),
      action: t('emailUsAction'),
      href: `mailto:${t('emailAddress')}`,
      highlight: false,
    },
    {
      Icon: HelpCircle,
      title: t('faq'),
      description: t('faqDesc'),
      action: t('faqAction'),
      href: '/trade/faq',
      highlight: false,
    },
    {
      Icon: BookOpen,
      title: t('helpCenter'),
      description: t('helpCenterDesc'),
      action: t('helpCenterAction'),
      href: '/help',
      highlight: false,
    },
  ]

  const quickLinks = [
    { Icon: Package, label: t('trackOrder'), href: '/account/orders' },
    { Icon: Repeat, label: t('startTradeIn'), href: '/trade' },
    { Icon: Truck, label: t('shippingInfo'), href: '/shipping' },
    { Icon: RotateCcw, label: t('returnPolicy'), href: '/returns' },
    { Icon: Shield, label: t('warrantyInfo'), href: '/warranty' },
  ]

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="size-8 text-primary" />
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

      {/* Contact Methods */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactMethods.map((method) => {
              const content = (
                <div
                  className={`flex flex-col h-full p-6 rounded-2xl border transition-colors ${
                    method.highlight
                      ? 'bg-primary text-white border-primary'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`size-12 rounded-xl flex items-center justify-center mb-4 ${
                      method.highlight ? 'bg-white/20' : 'bg-primary/10'
                    }`}
                  >
                    <method.Icon className={`size-6 ${method.highlight ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      method.highlight ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {method.title}
                  </h3>
                  <p
                    className={`text-sm mb-4 flex-1 ${
                      method.highlight ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {method.description}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${
                      method.highlight ? 'text-white' : 'text-primary'
                    }`}
                  >
                    {method.action} <ArrowRight className="size-4" />
                  </span>
                </div>
              )

              if (method.href) {
                return method.href.startsWith('mailto:') ? (
                  <a key={method.title} href={method.href}>
                    {content}
                  </a>
                ) : (
                  <Link key={method.title} href={method.href}>
                    {content}
                  </Link>
                )
              }

              // Live chat card — no link, the floating chat widget handles it
              return <div key={method.title}>{content}</div>
            })}
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('hours')}</p>
                <p className="text-sm text-slate-500">{t('hoursValue')}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('responseTime')}</p>
                <p className="text-sm text-slate-500">{t('responseTimeValue')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white dark:bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            {t('quickLinks')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/50 transition-colors group"
              >
                <link.Icon className="size-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <ArrowRight className="size-4 text-slate-400 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
