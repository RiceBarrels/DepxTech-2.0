import { getTranslations } from 'next-intl/server'

export async function AcceptedBrands() {
  const t = await getTranslations('trade.acceptedBrands')

  const categories = [
    { label: t('smartphones'), brands: t('smartphoneBrands') },
    { label: t('laptops'), brands: t('laptopBrands') },
    { label: t('tablets'), brands: t('tabletBrands') },
    { label: t('gaming'), brands: t('gamingBrands') },
    { label: t('wearables'), brands: t('wearableBrands') },
  ]

  return (
    <section className="w-full max-w-7xl py-12 sm:py-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('subheading')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="p-4 sm:p-5 bg-card rounded-xl border border-border text-center"
          >
            <p className="font-semibold text-sm text-foreground mb-2">{cat.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{cat.brands}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
