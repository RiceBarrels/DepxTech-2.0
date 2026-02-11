import TradeSearch from './TradeSearch'

export default function TradeHero() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 pt-24 pb-16 px-4 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
        Trade In Your Tech
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl">
        Get instant quotes, free shipping, and fast payment for your old devices.
      </p>
      <div className="w-full max-w-xl mt-2">
        <TradeSearch variant="hero" />
      </div>
    </section>
  )
}
