'use client'

import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogInIcon, UserPlusIcon, Sparkles, ShoppingBag, Gift, Star } from 'lucide-react'

export default function MobileSetupScreen() {
  return (
    <div className="flex flex-col py-4 px-4 gap-2 w-full justify-between items-center">
      <div className="flex-1 flex flex-col justify-center items-center max-w-256 w-full">
        <div className="flex flex-col md:flex-row w-full md:h-100 items-center m-8 border rounded-4xl overflow-hidden">
          {/* Left side - Branding */}
          <div className="w-full flex flex-col md:h-100 p-12 pb-8 md:p-12 gap-5 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="size-6 text-primary" />
              <h1 className="text-2xl font-black">DepxTech</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome to Your Premium Electronics Store
            </h2>
            <p className="text-md text-muted-foreground">
              Get started by creating an account or signing in to access your orders, wishlist, and personalized recommendations.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-5 text-primary" />
                <span className="text-sm">Shop premium electronics</span>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="size-5 text-primary" />
                <span className="text-sm">Trade in your old devices</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="size-5 text-primary" />
                <span className="text-sm">Exclusive deals & offers</span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-72 hidden md:block">
            <Separator orientation="vertical" className="h-72"/>
          </div>
          <div className="w-72 block md:hidden">
            <Separator orientation="horizontal" className="w-72"/>
          </div>

          {/* Right side - Actions */}
          <div className="w-full flex flex-col p-8 pt-6 md:p-12 gap-4">
            <div className="space-y-3">
              <TransitionLink href="/signup" className="block">
                <Button
                  type="button"
                  className="w-full h-auto py-5 flex items-center justify-center gap-3 text-base font-semibold"
                  size="lg"
                >
                  <UserPlusIcon className="size-5" />
                  Create Account
                </Button>
              </TransitionLink>

              <TransitionLink href="/login" className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-auto py-5 flex items-center justify-center gap-3 text-base font-semibold"
                  size="lg"
                >
                  <LogInIcon className="size-5" />
                  Sign In
                </Button>
              </TransitionLink>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


