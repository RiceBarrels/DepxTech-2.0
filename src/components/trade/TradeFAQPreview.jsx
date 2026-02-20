import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { getTranslations } from 'next-intl/server'

export async function TradeFAQPreview() {
  const t = await getTranslations('trade.faqPreview')

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
  ]

  return (
    <section className="w-full max-w-4xl mx-auto py-12 sm:py-16 px-4">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">{t('heading')}</h2>

      <Accordion type="single" collapsible className="space-y-3 mb-8">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
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

      <div className="text-center">
        <Link
          href="/trade/faq"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          {t('viewAllFaqs')} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
