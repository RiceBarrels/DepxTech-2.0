import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import {
  HelpCircle,
  MessageCircle,
  Mail,
  ArrowRight
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQPageStructuredData } from '@/components/seo/StructuredData'

export default async function FAQPage() {
  const t = await getTranslations('faq')

  const faqCategories = [
    {
      category: t('gettingStarted'),
      questions: [
        { q: t('questions.howDoesItWork.q'), a: t('questions.howDoesItWork.a') },
        { q: t('questions.whatDevices.q'), a: t('questions.whatDevices.a') },
        { q: t('questions.howToGetQuote.q'), a: t('questions.howToGetQuote.a') },
      ]
    },
    {
      category: t('quotesAndPricing'),
      questions: [
        { q: t('questions.howIsQuoteCalculated.q'), a: t('questions.howIsQuoteCalculated.a') },
        { q: t('questions.howLongValid.q'), a: t('questions.howLongValid.a') },
        { q: t('questions.conditionDiffers.q'), a: t('questions.conditionDiffers.a') },
      ]
    },
    {
      category: t('shipping'),
      questions: [
        { q: t('questions.freeShipping.q'), a: t('questions.freeShipping.a') },
        { q: t('questions.howToPack.q'), a: t('questions.howToPack.a') },
        { q: t('questions.trackShipment.q'), a: t('questions.trackShipment.a') },
      ]
    },
    {
      category: t('payment'),
      questions: [
        { q: t('questions.paymentMethods.q'), a: t('questions.paymentMethods.a') },
        { q: t('questions.howQuicklyPaid.q'), a: t('questions.howQuicklyPaid.a') },
        { q: t('questions.anyFees.q'), a: t('questions.anyFees.a') },
      ]
    },
    {
      category: t('dataSecurity'),
      questions: [
        { q: t('questions.whatHappensToData.q'), a: t('questions.whatHappensToData.a') },
        { q: t('questions.needFactoryReset.q'), a: t('questions.needFactoryReset.a') },
        { q: t('questions.paymentSecure.q'), a: t('questions.paymentSecure.a') },
      ]
    },
    {
      category: t('deviceCondition'),
      questions: [
        { q: t('questions.crackedScreens.q'), a: t('questions.crackedScreens.a') },
        { q: t('questions.doesntTurnOn.q'), a: t('questions.doesntTurnOn.a') },
        { q: t('questions.waterDamage.q'), a: t('questions.waterDamage.a') },
      ]
    },
  ]

  const allQuestions = faqCategories.flatMap(cat => cat.questions)

  return (
    <main className="bg-background">
      <FAQPageStructuredData questions={allQuestions} />
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              {t('heading')}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t('subheading')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 md:space-y-12">
            {faqCategories.map((category, catIndex) => (
              <div key={category.category}>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${catIndex}-${index}`}
                      className="border border-border bg-card rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground px-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('contactHeading')}
            </h2>
            <p className="text-muted-foreground">
              {t('contactSubheading')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <a
              href="mailto:support@depxtech.com"
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-muted/50 rounded-2xl hover:bg-muted transition-colors"
            >
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Mail className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('emailUs')}</p>
                <p className="text-sm text-muted-foreground">{t('emailAddress')}</p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-muted/50 rounded-2xl hover:bg-muted transition-colors"
            >
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('liveChat')}</p>
                <p className="text-sm text-muted-foreground">{t('liveChatHours')}</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('ctaSubheading')}
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold py-4 px-8 rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t('ctaButton')} <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
