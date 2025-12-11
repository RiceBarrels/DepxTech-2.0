'use client'

import { TransitionLink, useTransitionRouter } from '@/components/ui/pageTransitions'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Recommends from '@/components/ui/recommends'
import {
  Star, Truck, Shield,
  CreditCard, Package, Sparkles, Gift,
  Clock, ArrowRight, Bell
} from 'lucide-react'

const HeroSection = () => {
  return (
    <div className="relative py-20 md:py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to DepxTech
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-6">
          Your Premium Electronics Store
        </p>
        <p className="text-lg text-muted-foreground mb-8">
          Latest tech, best prices, premium quality electronics
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <TransitionLink href="/products">
            <Button size="lg" className="px-8">
              Shop Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </TransitionLink>
          <TransitionLink href="/trade">
            <Button size="lg" variant="outline" className="px-8">
              <Gift className="mr-2 w-4 h-4" />
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
    <Card className="h-full">
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

const CategoryShowcase = () => {
  const categories = [
    { name: "Smartphones", emoji: "📱", count: 85 },
    { name: "Laptops", emoji: "💻", count: 62 },
    { name: "Headphones", emoji: "🎧", count: 47 },
    { name: "Gaming", emoji: "🎮", count: 38 },
    { name: "Smart Home", emoji: "🏠", count: 29 },
    { name: "Accessories", emoji: "🔌", count: 94 }
  ]

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Shop Electronics by Category
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <TransitionLink
            key={category.name}
            href="/products"
            className="bg-muted rounded-lg p-6 text-center hover:bg-muted/80 transition-colors"
          >
            <div className="text-4xl mb-2">{category.emoji}</div>
            <h3 className="font-semibold mb-1">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.count} items</p>
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
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryShowcase />
        
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose DepxTech?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of quality, service, and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        <div className="mt-8">
          <Recommends 
            title="Trending Products"
            limit={12}
            onProductClick={handleProductClick}
          />
        </div>
        
        {user ? (
          <div className="py-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back, {user.email}!</CardTitle>
                <CardDescription>
                  Enjoy exclusive member benefits and personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <TransitionLink href="/account/orders">
                    <Button>
                      View Orders
                    </Button>
                  </TransitionLink>
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-16">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 text-primary">
                  <Bell className="w-12 h-12" />
                </div>
                <CardTitle className="text-2xl">Join DepxTech Today!</CardTitle>
                <CardDescription>
                  Create an account to unlock exclusive deals and member benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <TransitionLink href="/signup">
                    <Button size="lg">
                      Create Account
                      <Sparkles className="ml-2 w-4 h-4" />
                    </Button>
                  </TransitionLink>
                  <TransitionLink href="/login">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </TransitionLink>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="py-16 border-t">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">Subscribe to get exclusive offers and new product updates</p>
            <div className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <Button>
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