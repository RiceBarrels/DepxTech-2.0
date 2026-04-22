import { MacbookScroll } from '@/components/ui/macbook-scroll'
import { getTranslations } from 'next-intl/server'

export async function MacbookShowcase() {
  const t = await getTranslations('home.hero')
  const flipWords = t.raw('flipWords')
  const primaryAction = Array.isArray(flipWords) ? flipWords[0] : 'Trade'

  return (
    <section className="w-full bg-background dark:bg-[#07070f]">
      <MacbookScroll
        title={
          <span className="text-slate-900 dark:text-white font-semibold tracking-tight">
            {t('headline1')} {primaryAction} {t('headline2').trim()}.
          </span>
        }
        src="/stockImg/Frame 1.png"
        showGradient={false}
      />
    </section>
  )
}
