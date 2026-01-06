'use client'

import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Recommends from '@/components/ui/recommends'
import {
  Star, Truck, Shield,
  CreditCard, Package, Sparkles, Gift,
  Clock, ArrowRight, Bell, X, ChevronRight
} from 'lucide-react'
import { useState } from 'react'


const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!isVisible) return null
  
  return (
    <div className="relative bg-primary text-primary-foreground py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm md:text-base">
        <span className="font-medium">🎉 New Year Sale: Up to 30% off on selected items</span>
        <TransitionLink 
          href="/offers" 
          className="underline hover:no-underline font-semibold flex items-center gap-1"
        >
          Shop deals
          <ChevronRight className="w-4 h-4" />
        </TransitionLink>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const HeroSection = () => {
  return (
    <div className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background -z-10" />
      
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-block mb-6">
          <span className="text-sm md:text-base font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
            Premium Electronics Store
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            DepxTech
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-4 font-light max-w-3xl mx-auto">
          Latest tech, best prices, premium quality electronics
        </p>
        
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Discover smartphones, laptops, headphones, gaming gear, and smart home devices
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <TransitionLink href="/products">
            <Button size="lg" className="px-8 text-base h-14">
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </TransitionLink>
          <TransitionLink href="/trade">
            <Button size="lg" variant="outline" className="px-8 text-base h-14 border-2">
              <Gift className="mr-2 w-5 h-5" />
              Trade In Program
            </Button>
          </TransitionLink>
        </div>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <Card className="h-full border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
      <CardHeader>
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

const CategoryShowcase = () => {
  const categories = [
    { name: "Smartphones", emoji: "📱", count: 85, color: "from-blue-500/10 to-cyan-500/10" },
    { name: "Laptops", emoji: "💻", count: 62, color: "from-purple-500/10 to-pink-500/10" },
    { name: "Headphones", emoji: "🎧", count: 47, color: "from-green-500/10 to-emerald-500/10" },
    { name: "Gaming", emoji: "🎮", count: 38, color: "from-orange-500/10 to-red-500/10" },
    { name: "Smart Home", emoji: "🏠", count: 29, color: "from-indigo-500/10 to-blue-500/10" },
    { name: "Accessories", emoji: "🔌", count: 94, color: "from-yellow-500/10 to-amber-500/10" }
  ]

  return (
    <div className="py-12 md:py-20">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Shop by Category
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of premium electronics
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categories.map((category) => (
          <TransitionLink
            key={category.name}
            href="/products"
            className="group relative bg-gradient-to-br bg-card border rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className="text-5xl md:text-6xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {category.emoji}
              </div>
              <h3 className="font-semibold text-base md:text-lg mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">{category.count} items</p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  )
}

export default function HomePageClient() {
  const { user, signOut } = useAuth()
  const router = useTransitionRouter()

  const handleProductClick = async (product) => {
    await router.push(`/products/${product.id}`)
  }

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free delivery on orders over $50. Fast and reliable shipping worldwide."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your transactions are protected with industry-leading encryption."
    },
    {
      icon: Package,
      title: "Easy Returns",
      description: "30-day hassle-free return policy on all products."
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Options",
      description: "Pay with credit cards, PayPal, or buy now pay later options."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our customer service team is here to help you anytime."
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Curated selection of high-quality products from trusted brands."
    }
  ]

  return (
    <div className="min-h-screen">
      <PromoBanner />
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryShowcase />
        
        <div className="py-12 md:py-20">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Why Choose DepxTech?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of quality, service, and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
        
        <div className="py-12 md:py-20">
          <Recommends 
            title="Trending Products"
            limit={12}
            onProductClick={handleProductClick}
          />
        </div>
        
        {user ? (
          <div className="py-12 md:py-20">
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl mb-2">Welcome back, {user.email?.split('@')[0]}!</CardTitle>
                <CardDescription className="text-lg">
                  Enjoy exclusive member benefits and personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <TransitionLink href="/account/orders">
                    <Button size="lg" className="h-12">
                      View Orders
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </TransitionLink>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="h-12 border-2"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-12 md:py-20">
            <Card className="text-center border-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8" />
                </div>
                <CardTitle className="text-3xl md:text-4xl mb-2">Join DepxTech Today!</CardTitle>
                <CardDescription className="text-lg">
                  Create an account to unlock exclusive deals and member benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <TransitionLink href="/signup">
                    <Button size="lg" className="h-12">
                      Create Account
                      <Sparkles className="ml-2 w-4 h-4" />
                    </Button>
                  </TransitionLink>
                  <TransitionLink href="/login">
                    <Button size="lg" variant="outline" className="h-12 border-2">
                      Sign In
                    </Button>
                  </TransitionLink>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="py-12 md:py-20 border-t">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Stay Updated</h3>
            <p className="text-lg text-muted-foreground mb-8">Subscribe to get exclusive offers and new product updates</p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-input border-2 border-border rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-foreground text-base"
              />
              <Button size="lg" className="h-12 px-6 rounded-full">
                Subscribe
                <Bell className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
