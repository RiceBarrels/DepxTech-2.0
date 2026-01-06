import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Gift, Truck, Clock, Ticket, Star, Sparkles, Crown, Zap } from "lucide-react"

export const metadata = {
  title: "Premium Membership Benefits | DepxTech 2.0",
  description: "Join our exclusive membership program with free shipping, monthly gifts valued at $50, 24hr NYC delivery, and weekly surprise offers. Starting at $14.99/month.",
  keywords: "membership, premium benefits, free shipping, monthly gifts, fast delivery, exclusive offers, subscription",
  openGraph: {
    title: "Premium Membership Benefits | DepxTech 2.0",
    description: "Unlock exclusive perks with free shipping, $50 monthly gifts, 24hr NYC delivery & weekly offers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Membership Benefits | DepxTech 2.0",
    description: "Unlock exclusive perks with free shipping, $50 monthly gifts, 24hr NYC delivery & weekly offers",
  }
}

export default function AboutPage() {
  const benefits = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Free Shipping",
      description: "Complimentary shipping on all orders",
      highlight: "Always Free",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Monthly Premium Gift",
      description: "Carefully curated gift every month",
      highlight: "~$50 Value",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "24hr NYC Express",
      description: "Lightning-fast delivery within NYC",
      highlight: "Next Day",
      gradient: "from-orange-500/20 to-red-500/20"
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: "Surprise Weekly Offers",
      description: "Random high-value offers every week",
      highlight: "$5-20 Value",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ]

  const pricingPlans = [
    {
      title: "Monthly",
      price: "$14.99",
      period: "/month",
      description: "Perfect for trying out our membership",
      popular: false,
      annualEquivalent: "$179.88/year",
      icon: <Star className="h-5 w-5" />
    },
    {
      title: "Annual",
      price: "$149.99",
      period: "/year",
      description: "Best value - save over $30 per year",
      popular: true,
      savings: "Save $29.89",
      monthlyEquivalent: "$12.50/month",
      icon: <Crown className="h-5 w-5" />
    }
  ]

  const testimonialHighlights = [
    "Over 10,000 happy members",
    "98% member satisfaction rate",
    "Average $200+ in annual savings"
  ]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hero Section with Animated Background */}
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-muted/5 rounded-full blur-3xl animate-pulse [animation-delay:0.5s]"></div>
          </div>

          <div className="relative container mx-auto py-16 px-4 max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Premium Membership
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in-up">
                Unlock Exclusive
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Premium Benefits
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:0.2s]">
                Join thousands of satisfied members enjoying exclusive perks, significant savings, and premium experiences
              </p>

              {/* Social Proof */}
              <div className="flex flex-wrap justify-center gap-8 mt-8 animate-fade-in-up [animation-delay:0.3s]">
                {testimonialHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {benefits.map((benefit, index) => (
                <Card key={index} className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-primary/20 animate-fade-in-up`} style={{animationDelay: `${100 * (index + 1)}ms`}}>
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {benefit.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {benefit.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Pricing Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-fade-in-up">
                Choose Your
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> Perfect Plan</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.1s]">
                Select the membership option that works best for your lifestyle and budget
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`relative group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-xl scale-105 bg-gradient-to-br from-card to-primary/5' 
                    : 'border-2 border-transparent hover:border-primary/30'
                }`} style={{animationDelay: `${200 + index * 100}ms`}}>
                  
                  {/* Popular badge with glow effect */}
                  {plan.popular && (
                    <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm font-bold shadow-lg animate-pulse rounded-t-none">
                        <Crown className="h-4 w-4 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Glow effect for popular plan */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse"></div>
                  )}

                  <CardHeader className="relative text-center pb-8 pt-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                        {plan.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold">{plan.price}</span>
                        <span className="text-lg text-muted-foreground">{plan.period}</span>
                      </div>
                      
                      {plan.monthlyEquivalent && (
                        <p className="text-sm text-muted-foreground">
                          Just {plan.monthlyEquivalent}
                        </p>
                      )}
                      
                      {plan.annualEquivalent && (
                        <p className="text-sm text-muted-foreground">
                          {plan.annualEquivalent} billed annually
                        </p>
                      )}
                      
                      {plan.savings && (
                        <Badge variant="secondary" className="text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 font-semibold">
                          💰 {plan.savings}
                        </Badge>
                      )}
                    </div>
                    
                    <CardDescription className="mt-4 text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-6">
                    <Button 
                      size="lg" 
                      className={`w-full text-lg py-6 font-semibold transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      Get Started with {plan.title}
                      <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                    
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-center border-b border-border pb-2">
                        Everything included:
                      </p>
                      {benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-3 text-sm py-1">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="font-medium">{benefit.title}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {benefit.highlight}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="text-center animate-fade-in-up [animation-delay:0.6s]">
              <Card className="max-w-3xl mx-auto bg-gradient-to-r from-card to-muted/30 border-2 border-primary/10">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      100% Risk-Free Guarantee
                    </p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Cancel anytime with just one click. No hidden fees, no contracts, no hassle. 
                    Your membership benefits activate immediately upon signup, and you can start saving today.
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-green-500" />
                      Instant activation
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-green-500" />
                      Cancel anytime
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-green-500" />
                      Money-back guarantee
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}