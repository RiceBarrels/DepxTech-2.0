const brands = [
  'Apple', 'Samsung', 'Google', 'Sony', 'Microsoft',
  'Lenovo', 'Dell', 'HP', 'ASUS', 'OnePlus',
  'NVIDIA', 'AMD', 'Intel', 'Acer', 'Motorola',
]

export function BrandMarquee() {
  return (
    <section className="py-16 overflow-hidden border-y border-slate-200 dark:border-slate-800">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="mx-8 sm:mx-12 text-base sm:text-lg font-medium text-slate-400 dark:text-slate-600 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
