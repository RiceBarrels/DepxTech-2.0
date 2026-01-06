import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  SmartphoneIcon, 
  LaptopIcon, 
  TabletIcon, 
  GamepadIcon, 
  HeadphonesIcon, 
  CpuIcon, 
  HardDriveIcon, 
  MonitorIcon,
  ArrowRightIcon,
  DollarSignIcon,
  RecycleIcon,
  ShieldCheckIcon,
  PackageIcon,
  CheckCircleIcon,
  StarIcon,
  TruckIcon,
  ShieldIcon
} from 'lucide-react'
import { TransitionLink } from '@/components/ui/pageTransitions'
import Image from 'next/image'

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
  const tradeCategories = [
    {
      id: 'phone',
      title: 'Smartphones',
      description: 'iPhone, Samsung, Google Pixel & more',
      icon: SmartphoneIcon,
      route: '/trade/phone',
      estimatedValue: '$50 - $800',
      popular: true
    },
    {
      id: 'laptop',
      title: 'Laptops',
      description: 'MacBook, Dell, HP, Lenovo & more',
      icon: LaptopIcon,
      route: '/trade/laptop',
      estimatedValue: '$100 - $1500',
      popular: true
    },
    {
      id: 'tablet',
      title: 'Tablets',
      description: 'iPad, Surface, Galaxy Tab & more',
      icon: TabletIcon,
      route: '/trade/tablet',
      estimatedValue: '$30 - $600',
      popular: false
    },
    {
      id: 'console',
      title: 'Gaming Consoles',
      description: 'PlayStation, Xbox, Nintendo Switch',
      icon: GamepadIcon,
      route: '/trade/console',
      estimatedValue: '$50 - $400',
      popular: true
    },
    {
      id: 'audio',
      title: 'Audio Devices',
      description: 'AirPods, Headphones, Speakers',
      icon: HeadphonesIcon,
      route: '/trade/audio',
      estimatedValue: '$20 - $300',
      popular: false
    },
    {
      id: 'cpu',
      title: 'Processors (CPU)',
      description: 'Intel, AMD desktop & laptop CPUs',
      icon: CpuIcon,
      route: '/trade/cpu',
      estimatedValue: '$30 - $500',
      popular: false
    },
    {
      id: 'gpu',
      title: 'Graphics Cards',
      description: 'NVIDIA, AMD graphics cards',
      icon: MonitorIcon,
      route: '/trade/gpu',
      estimatedValue: '$50 - $1000',
      popular: true
    },
    {
      id: 'ram',
      title: 'Memory (RAM)',
      description: 'DDR4, DDR5 desktop & laptop RAM',
      icon: HardDriveIcon,
      route: '/trade/ram',
      estimatedValue: '$10 - $200',
      popular: false
    }
  ]

  const benefits = [
    {
      icon: DollarSignIcon,
      title: 'Best Prices',
      description: 'Get top dollar for your tech'
    },
    {
      icon: RecycleIcon,
      title: 'Eco-Friendly',
      description: 'Reduce electronic waste'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Process',
      description: 'Safe & certified data wiping'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Jawa Style */}
      <div className="bg-gradient-to-b from-background via-muted/30 to-background py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            The simplest & fastest way to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              sell your tech
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sell your functioning devices to DepxTech directly for instant cash.
          </p>
          
          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">Check us out on Trustpilot</span>
          </div>

          {/* Featured Categories - GPU & CPU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            <TransitionLink href="/trade/category/Graphics Cards">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 h-full">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-6 relative">
                      <Image
                        src="/stockImg/3060 GPU.png"
                        alt="GPU"
                        fill
                        className="object-contain group-hover:scale-175 group-hover:rotate-30 filter brightness-100 contrast-100 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] drop-shadow-primary transition-transform duration-300"
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Sell your GPU</h2>
                    <p className="text-muted-foreground mb-4">Get instant offers for your graphics card</p>
                    <div className="w-full bg-muted/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Estimated Payout</p>
                      <p className="text-2xl font-bold text-green-600">$50 - $1,000</p>
                    </div>
                    <Button size="lg" className="w-full">
                      Get an instant GPU offer
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TransitionLink>

            <TransitionLink href="/trade/category/Processors (CPU)">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 h-full">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-6 relative">
                      <Image
                        src="/stockImg/Ryzen Processor.png"
                        alt="CPU"
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Sell your CPU</h2>
                    <p className="text-muted-foreground mb-4">Get instant offers for your processor</p>
                    <div className="w-full bg-muted/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Estimated Payout</p>
                      <p className="text-2xl font-bold text-green-600">$30 - $500</p>
                    </div>
                    <Button size="lg" variant="outline" className="w-full border-2">
                      Get an instant CPU offer
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TransitionLink>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Get the best price section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get the best price for your parts</h2>
          <p className="text-lg text-muted-foreground mb-8">
            DepxTech offers honest pricing, free shipping, and no hidden fees.
          </p>
          
          {/* Example Prices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="border-2">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">GPU</p>
                <p className="font-semibold mb-2">NVIDIA GeForce RTX 3060Ti</p>
                <p className="text-2xl font-bold text-green-600">$139.00</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">GPU</p>
                <p className="font-semibold mb-2">NVIDIA GeForce RTX 3070</p>
                <p className="text-2xl font-bold text-green-600">$144.00</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">GPU</p>
                <p className="font-semibold mb-2">NVIDIA GeForce RTX 3080</p>
                <p className="text-2xl font-bold text-green-600">$217.00</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Sell your gear to DepxTech</h2>
          <p className="text-center text-muted-foreground mb-12">
            See how much you can get for your part. It's free and only takes a couple minutes.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {tradeCategories.map((category) => (
              <TransitionLink
                key={category.id} 
                href={`/trade/category/${encodeURIComponent(category.title)}`}
                className="block"
              >
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <category.icon className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{category.estimatedValue}</p>
                    {category.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </TransitionLink>
            ))}
          </div>
        </div>

        {/* How It Works Section - Jawa Style */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Get an offer</h3>
              <p className="text-muted-foreground">
                Share details about your part for an instant offer.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Ship it</h3>
              <p className="text-muted-foreground">
                Print your free shipping label and mail us your part.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Inspection</h3>
              <p className="text-muted-foreground">
                We'll inspect your part to make sure everything checks out.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-lg mb-2">Get paid</h3>
              <p className="text-muted-foreground">
                We pay you out via PayPal quickly!
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">The gamers have spoken</h2>
          <p className="text-center text-muted-foreground mb-8">
            See why thousands of people have trusted DepxTech.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-lg">Seller Protections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "DepxTech is a great site for both buying and selling, with a team that ensures every sale is legitimate and sellers are protected."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-lg">Fair Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "This feels more of a community than a marketplace. Everyone's reasonable and understanding with pricing and negotiation."
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <CardTitle className="text-lg">Tech Experts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "Easy to talk to sellers about any questions or concerns. Helpful channels with technical expertise available."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 text-center">
            <CardContent className="p-6">
              <ShieldIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Secure Process</h3>
              <p className="text-muted-foreground text-sm">
                Safe & certified data wiping guaranteed
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 text-center">
            <CardContent className="p-6">
              <TruckIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-muted-foreground text-sm">
                Prepaid shipping label included
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-2 text-center">
            <CardContent className="p-6">
              <DollarSignIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Fast Payment</h3>
              <p className="text-muted-foreground text-sm">
                Get paid within 1 week of receipt
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sell your GPU or CPU to DepxTech</h2>
          <p className="text-lg text-muted-foreground mb-8">
            See how much you can get for your part. It's free and only takes a couple minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TransitionLink href="/trade/category/Graphics Cards">
              <Button size="lg" className="w-full sm:w-auto">
                Sell your GPU
              </Button>
            </TransitionLink>
            <TransitionLink href="/trade/category/Processors (CPU)">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2">
                Sell your CPU
              </Button>
            </TransitionLink>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">FAQs</h2>
          <p className="text-center text-muted-foreground mb-8">
            All your questions answered.
          </p>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">How Does it Work?</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Submit your component info and get an offer - if the offer is up to snuff, you accept it and we issue you a prepaid shipping label within 1 business day.</li>
                  <li>Package your component in a suitable box and drop it off at UPS or USPS (label can vary depending on your location).</li>
                  <li>Once we receive your component, we'll test it to make sure it works. If it passes then we issue your payout within 1 week of receipt!</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">When and how will I get paid?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We pay you out via PayPal within 1 week of receiving and testing your component. Payment is fast and secure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">What if my component fails testing?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If your component doesn't pass our testing, we'll contact you to discuss options. You can choose to have it returned or accept a revised offer based on the actual condition.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Can I trust DepxTech?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! We're a trusted platform with thousands of satisfied customers. We offer secure transactions, fair pricing, and excellent customer service. Check out our reviews and ratings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}