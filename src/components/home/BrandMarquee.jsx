import { getTranslations } from 'next-intl/server'

const brands = [
  'Apple', 'Samsung', 'Google', 'Sony', 'Microsoft',
  'Lenovo', 'Dell', 'HP', 'ASUS', 'OnePlus',
  'NVIDIA', 'AMD', 'Intel', 'Acer', 'Motorola',
]

export async function BrandMarquee() {
  const t = await getTranslations('home.brandMarquee')

  return (
    <section className="py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {t('heading')}
        </p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="mx-6 sm:mx-10 text-xl sm:text-2xl font-bold text-slate-300 dark:text-slate-600 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
