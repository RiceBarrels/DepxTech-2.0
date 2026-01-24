import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
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

  // Category image mapping
  const categoryImageMap = {
    'Smartphone': {
      image: '/stockImg/tradein-cata-img/Smartphone.svg',
      href: '/trade/category/Smartphones',
    },
    'Laptop': {
      image: '/stockImg/tradein-cata-img/Laptop.svg',
      href: '/trade/category/Laptops',
    },
    'Tablet': {
      image: '/stockImg/tradein-cata-img/Tablet.svg',
      href: '/trade/category/Tablets',
    },
    'Gaming': {
      image: '/stockImg/tradein-cata-img/Gaming.svg',
      href: '/trade/category/Gaming',
    },
    'CPU': {
      image: '/stockImg/tradein-cata-img/CPU.svg',
      href: '/trade/category/Processors',
    },
    'GPU': {
      image: '/stockImg/tradein-cata-img/GPU.svg',
      href: '/trade/category/Graphics Cards',
    },
    'RAM': {
      image: '/stockImg/tradein-cata-img/RAM.svg',
      href: '/trade/category/Memory',
    },
    'Wearable': {
      image: '/stockImg/tradein-cata-img/Wearable.svg',
      href: '/trade/category/Wearables',
    }
  }
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center justify-center max-w-256 w-full py-16 gap-8">
        <h1 className="text-5xl text-center font-light">The Simplest & Fastest way to <br/> <span className="text-primary font-bold text-6xl">Sell Your Tech.</span></h1>
        <p className="text-lg text-center text-muted-foreground max-w-2xl">DepxTech make sure your devices continue delivering value long after you stop using them. When you’re ready to upgrade, our platform evaluates your current device and lets you apply its remaining value toward your next one.</p>
        
      </div>


      <div id="category-grid"  className="flex flex-col justify-center max-w-256 w-full py-16 gap-8">
        <h2 className="text-xl font-bold">Wanna sell your tech? Choose your category.</h2>
        <div className="grid grid-cols-2 gap-8 px-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(categoryImageMap).map(([categoryName, categoryData]) => (
            <TransitionLink href={categoryData.href} key={categoryName}>
              <div className="flex flex-col justify-center gap-2">
                <Image src={categoryData.image} alt={categoryName} width={256} height={256} className="w-full h-full object-contain" />
                <p className="text-md font-bold px-4">{categoryName}</p>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>

      <div className="flex justify-center max-w-256 w-full p-16 gap-8 bg-chart-2/10 rounded-lg">
        <div className="flex flex-col justify-center gap-4 flex-1">
          <h2 className="text-xl font-bold">Get an instant quote for your tech.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">We'll evaluate your device and give you a fair price for it.</p>
          <TransitionLink href="/trade#category-grid"><Button >Get a Quote</Button></TransitionLink>
        </div>
      </div>

      
    </div>
  )
}
