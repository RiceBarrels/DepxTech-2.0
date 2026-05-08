import { getTranslations } from 'next-intl/server'
import { HowItWorksSticky } from './HowItWorksSticky'

export async function HowItWorks() {
  const t = await getTranslations('home.howItWorks')

  const steps = [
    { iconKey: 'tag', title: t('step1Title'), description: t('step1Desc') },
    { iconKey: 'truck', title: t('step2Title'), description: t('step2Desc') },
    { iconKey: 'banknote', title: t('step3Title'), description: t('step3Desc') },
  ]

  return (
    <HowItWorksSticky
      heading={t('heading')}
      subheading={t('subheading')}
      steps={steps}
    />
  )
}
