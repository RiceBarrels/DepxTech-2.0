"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ForwardLink, useForwardRoutePush } from '@/components/ui/pageTransitions'
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
  ShieldCheckIcon
} from 'lucide-react'

export default function TradePage() {
  const forwardPush = useForwardRoutePush()

  const tradeCategories = [
    {
      id: 'phone',
      title: 'Smartphones',
      description: 'iPhone, Samsung, Google Pixel & more',
      icon: SmartphoneIcon,
      route: '/trade/phone',
      estimatedValue: '$50 - $800',
      popular: true,
      image: '/api/placeholder/300/200?text=Smartphones'
    },
    {
      id: 'laptop',
      title: 'Laptops',
      description: 'MacBook, Dell, HP, Lenovo & more',
      icon: LaptopIcon,
      route: '/trade/laptop',
      estimatedValue: '$100 - $1500',
      popular: true,
      image: '/api/placeholder/300/200?text=Laptops'
    },
    {
      id: 'tablet',
      title: 'Tablets',
      description: 'iPad, Surface, Galaxy Tab & more',
      icon: TabletIcon,
      route: '/trade/tablet',
      estimatedValue: '$30 - $600',
      popular: false,
      image: '/api/placeholder/300/200?text=Tablets'
    },
    {
      id: 'console',
      title: 'Gaming Consoles',
      description: 'PlayStation, Xbox, Nintendo Switch',
      icon: GamepadIcon,
      route: '/trade/console',
      estimatedValue: '$50 - $400',
      popular: true,
      image: '/api/placeholder/300/200?text=Gaming+Consoles'
    },
    {
      id: 'audio',
      title: 'Audio Devices',
      description: 'AirPods, Headphones, Speakers',
      icon: HeadphonesIcon,
      route: '/trade/audio',
      estimatedValue: '$20 - $300',
      popular: false,
      image: '/api/placeholder/300/200?text=Audio+Devices'
    },
    {
      id: 'cpu',
      title: 'Processors (CPU)',
      description: 'Intel, AMD desktop & laptop CPUs',
      icon: CpuIcon,
      route: '/trade/cpu',
      estimatedValue: '$30 - $500',
      popular: false,
      image: '/api/placeholder/300/200?text=Processors'
    },
    {
      id: 'gpu',
      title: 'Graphics Cards',
      description: 'NVIDIA, AMD graphics cards',
      icon: MonitorIcon,
      route: '/trade/gpu',
      estimatedValue: '$50 - $1000',
      popular: true,
      image: '/api/placeholder/300/200?text=Graphics+Cards'
    },
    {
      id: 'ram',
      title: 'Memory (RAM)',
      description: 'DDR4, DDR5 desktop & laptop RAM',
      icon: HardDriveIcon,
      route: '/trade/ram',
      estimatedValue: '$10 - $200',
      popular: false,
      image: '/api/placeholder/300/200?text=Memory+RAM'
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-accent-foreground mb-4">
            Trade In Your Tech
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Turn your old devices into cash. Fast, secure, and eco-friendly.
          </p>
          
          {/* Benefits Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 bg-accent/75 rounded-full px-4 py-2">
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{benefit.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tradeCategories.map((category) => (
            <ForwardLink 
                key={category.id} 
                href={category.route}
            >
                <Card 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                >
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                    <category.icon className="w-8 h-8 text-primary" />
                    {category.popular && (
                        <Badge variant="secondary" className="text-xs">
                        Popular
                        </Badge>
                    )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                    {category.description}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Placeholder Image */}
                    <div className="aspect-[3/2] bg-accent/50 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <category.icon className="w-16 h-16 text-primary/60" />
                    </div>
                    </div>
                    
                    {/* Estimated Value */}
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">Estimated Value</p>
                        <p className="text-sm font-semibold text-green-600">{category.estimatedValue}</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                </CardContent>
                </Card>
            </ForwardLink>
          ))}
        </div>

        {/* How It Works Section */}
        <Card className="bg-accent/50 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center mb-2">How It Works</CardTitle>
            <CardDescription className="text-center text-base">
              Get cash for your tech in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Select Your Device</h3>
                <p className="text-muted-foreground text-sm">
                  Choose your device category and provide details about its condition
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Get Instant Quote</h3>
                <p className="text-muted-foreground text-sm">
                  Receive an immediate quote based on current market values
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Ship & Get Paid</h3>
                <p className="text-muted-foreground text-sm">
                  Ship your device with our prepaid label and get paid fast
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ or Additional Info */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our trade-in process is designed to be simple, secure, and transparent.
          </p>
          <Button variant="outline" size="lg">
            View FAQ
          </Button>
        </div>
      </div>
    </div>
  )
}