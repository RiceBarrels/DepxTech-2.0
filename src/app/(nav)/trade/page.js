import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
import TradeHero from '@/components/trade/TradeHero'
import CategoryGrid from '@/components/trade/CategoryGrid'

export const metadata = {
  title: 'Trade In Your Tech',
  description: 'Trade in your old electronics at DepxTech. Get instant quotes for smartphones, laptops, tablets, gaming consoles, and more. Fast, secure, and eco-friendly trade-in process.',
  keywords: [
    'trade in',
    'electronics trade in',
    'smartphone trade in',
    'laptop trade in',
    'tablet trade in',
    'gaming console trade in',
    'depxtech',
    'sell electronics',
    'recycle electronics',
  ],
  openGraph: {
    title: 'Trade In Your Tech | DepxTech',
    description: 'Trade in your old electronics at DepxTech. Get instant quotes and turn your devices into cash.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TradePage() {
  return (
    <div className="flex flex-col items-center">
      <TradeHero />
      <CategoryGrid />

      {/* How It Works */}
      <section className="w-full max-w-5xl py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: 1, title: 'Get an Offer', desc: 'Answer a few questions about your device and receive an instant quote.' },
            { step: 2, title: 'Free Shipping', desc: 'Ship your device to us for free with a prepaid shipping label.' },
            { step: 3, title: 'Get Paid', desc: 'Once we verify your device, receive payment via your preferred method.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                {step}
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-5xl px-4 pb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-muted/40 rounded-xl">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Ready to trade in?</h2>
            <p className="text-muted-foreground">Get a fair price for your old tech today.</p>
          </div>
          <TransitionLink href="/trade#category-grid">
            <Button size="lg">Get a Quote</Button>
          </TransitionLink>
        </div>
      </section>
    </div>
  )
}
