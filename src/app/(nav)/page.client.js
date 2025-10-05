'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Recommends from '@/components/ui/recommends'
import { useRouter } from 'next/navigation'
import { useSpring, useTransition, animated, useScroll, useInView } from '@react-spring/web'
import { 
  ShoppingCart, Star, Truck, Shield, 
  CreditCard, Package, ChevronDown, Sparkles, Gift,
  Clock, ArrowRight, Tag, Percent, Bell
} from 'lucide-react'

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll()
  
  const scaleX = useSpring({
    transform: scrollYProgress.to(progress => `scaleX(${progress})`),
    config: { tension: 100, friction: 30 }
  })

  return (
    <animated.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
      style={scaleX}
    />
  )
}

const HeroSection = () => {
  const [ref, inView] = useInView()
  
  const heroSpring = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 800 }
  })
  
  const offerSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 200
  })
  
  const titleSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 300
  })
  
  const subtitleSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 400
  })
  
  const descSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 500
  })
  
  const buttonsSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 600
  })
  
  const chevronSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(20px)',
    config: { tension: 280, friction: 60 },
    delay: 1000
  })

  return (
    <animated.div
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={heroSpring}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
        <div className="absolute inset-0 bg-foreground/10" />
      </div>
      
      <div className="relative z-10 text-center text-primary-foreground px-4 max-w-5xl mx-auto">
        <animated.div style={offerSpring}>
          <span className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary-foreground/20">
            <Sparkles className="w-4 h-4" />
            LIMITED TIME OFFER - UP TO 50% OFF
            <Sparkles className="w-4 h-4" />
          </span>
        </animated.div>
        
        <animated.h1 className="text-5xl md:text-7xl font-bold mb-6" style={titleSpring}>
          Welcome to DepxTech
          <animated.span
            className="block text-3xl md:text-5xl mt-2 text-primary-foreground/90"
            style={subtitleSpring}
          >
            Your Premium Electronics Store
          </animated.span>
        </animated.h1>
        
        <animated.p
          className="text-xl md:text-2xl mb-8 opacity-90"
          style={descSpring}
        >
          Latest tech, best prices, premium quality electronics
        </animated.p>
        
        <animated.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          style={buttonsSpring}
        >
          <Link href="/products">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold">
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/trade">
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-6 text-lg">
              <Gift className="mr-2 w-5 h-5" />
              Trade In Program
            </Button>
          </Link>
        </animated.div>
        
        <animated.div className="mt-12" style={chevronSpring}>
          <ChevronDown className="w-8 h-8 mx-auto animate-bounce" />
        </animated.div>
      </div>
    </animated.div>
  )
}

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  
  const [hoverSpring, setHover] = useSpring(() => ({
    transform: 'translateY(0px)',
    config: { tension: 400, friction: 30 }
  }))
  
  const [iconSpring, setIcon] = useSpring(() => ({
    transform: 'rotate(0deg)',
    config: { tension: 300, friction: 25 }
  }))

  const cardSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 200, friction: 25 },
    delay: delay
  })

  return (
    <animated.div
      ref={ref}
      className="group"
      style={{ ...cardSpring, ...hoverSpring }}
      onMouseEnter={() => {
        setHover.start({ transform: 'translateY(-5px)' })
        setIcon.start({ transform: 'rotate(360deg)' })
      }}
      onMouseLeave={() => {
        setHover.start({ transform: 'translateY(0px)' })
        setIcon.start({ transform: 'rotate(0deg)' })
      }}
    >
      <Card className="h-full border-2 hover:border-primary transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative">
          <animated.div
            className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
            style={iconSpring}
          >
            <Icon className="w-6 h-6 text-primary" />
          </animated.div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <CardDescription className="text-base">{description}</CardDescription>
        </CardContent>
      </Card>
    </animated.div>
  )
}

const CategoryShowcase = () => {
  const categories = [
    { name: "Smartphones", emoji: "📱", color: "from-primary/80 to-primary", count: 85 },
    { name: "Laptops", emoji: "💻", color: "from-secondary/80 to-secondary", count: 62 },
    { name: "Headphones", emoji: "🎧", color: "from-accent to-accent-foreground/20", count: 47 },
    { name: "Gaming", emoji: "🎮", color: "from-muted to-muted-foreground/30", count: 38 },
    { name: "Smart Home", emoji: "🏠", color: "from-primary/60 to-primary/90", count: 29 },
    { name: "Accessories", emoji: "🔌", color: "from-secondary/60 to-secondary/90", count: 94 }
  ]

  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  const containerSpring = useSpring({
    opacity: inView ? 1 : 0,
    config: { tension: 280, friction: 60 }
  })

  const titleSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 200
  })

  const transitions = useTransition(categories, {
    from: { transform: 'scale(0)', opacity: 0 },
    enter: (_, index) => ({
      transform: 'scale(1)',
      opacity: 1,
      delay: index * 100
    }),
    config: { tension: 200, friction: 25 }
  })

  return (
    <animated.div
      ref={ref}
      className="py-16"
      style={containerSpring}
    >
      <animated.h2
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        style={titleSpring}
      >
        Shop Electronics by Category
      </animated.h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {transitions((style, category) => (
          <CategoryCard key={category.name} category={category} style={style} />
        ))}
      </div>
    </animated.div>
  )
}

const CategoryCard = ({ category, style }) => {
  const [hoverSpring, setHover] = useSpring(() => ({
    transform: 'scale(1) translateY(0px)',
    config: { tension: 400, friction: 30 }
  }))
  
  const [emojiSpring, setEmoji] = useSpring(() => ({
    transform: 'rotate(0deg)',
    config: { tension: 300, friction: 25 }
  }))

  return (
    <animated.div
      className="cursor-pointer"
      style={{ ...style, ...hoverSpring }}
      onMouseEnter={() => {
        setHover.start({ transform: 'scale(1.05) translateY(-5px)' })
        setEmoji.start({ transform: 'rotate(-10deg)' })
      }}
      onMouseLeave={() => {
        setHover.start({ transform: 'scale(1) translateY(0px)' })
        setEmoji.start({ transform: 'rotate(0deg)' })
      }}
    >
      <div className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-primary-foreground text-center shadow-lg`}>
        <animated.div className="text-4xl mb-2" style={emojiSpring}>
          {category.emoji}
        </animated.div>
        <h3 className="font-semibold">{category.name}</h3>
        <p className="text-xs opacity-90 mt-1">{category.count} items</p>
      </div>
    </animated.div>
  )
}

export default function HomePageClient() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleProductClick = async (product) => {
    router.push(`/products/${product.id}`)
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

  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  const featuresSpring = useSpring({
    opacity: inView ? 1 : 0,
    config: { tension: 280, friction: 60 }
  })

  const featuresTitleSpring = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { tension: 280, friction: 60 },
    delay: 200
  })

  const recommendsSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 60 }
  })

  const userSectionSpring = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 280, friction: 60 }
  })

  const newsletterSpring = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 280, friction: 60 }
  })

  return (
    <>
      <ScrollProgressBar />
      
      <div className="min-h-screen">
        <HeroSection />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryShowcase />
          
          <animated.div
            ref={ref}
            className="py-16"
            style={featuresSpring}
          >
            <animated.h2
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={featuresTitleSpring}
            >
              Why Choose DepxTech?
            </animated.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 100}
                />
              ))}
            </div>
          </animated.div>
          
          <animated.div style={recommendsSpring}>
            <Recommends 
              title="Trending Products"
              limit={12}
              className="mt-8"
              onProductClick={handleProductClick}
            />
          </animated.div>
          
          {user ? (
            <animated.div className="py-16" style={userSectionSpring}>
              <Card className="bg-gradient-to-r from-muted to-accent text-accent-foreground border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back, {user.email}!</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enjoy exclusive member benefits and personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Link href="/account/orders">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        View Orders
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={signOut}
                      className="border-accent-foreground flex-1 text-accent-foreground hover:bg-accent-foreground/10"
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </animated.div>
          ) : (
            <animated.div className="py-16" style={userSectionSpring}>
              <Card className="text-center bg-gradient-to-r from-background to-muted border-2 border-border">
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
                    <Link href="/signup">
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        Create Account
                        <Sparkles className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </animated.div>
          )}
          
          <animated.div
            className="py-16 border-t"
            style={newsletterSpring}
          >
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
          </animated.div>
        </div>
      </div>
    </>
  )
}