'use client'

import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
import { LogInIcon, UserPlusIcon, ShoppingBag, ArrowRightLeft, Zap } from 'lucide-react'

export default function MobileSetupScreen() {
  return (
    <div className="flex flex-col min-h-[80dvh] px-6 py-10 w-full items-center justify-center">
      <div className="flex flex-col items-center max-w-sm w-full gap-10">
        {/* Logo & headline */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl font-black text-primary-foreground tracking-tight">D</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">DepxTech</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your premium marketplace for electronics — shop, trade in, and save.
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>Shop</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
            <ArrowRightLeft className="size-3.5 text-primary" />
            <span>Trade-in</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
            <Zap className="size-3.5 text-primary" />
            <span>Deals</span>
          </div>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col w-full gap-3">
          <TransitionLink href="/signup" className="block">
            <Button className="w-full h-12 text-base font-semibold gap-2" size="lg">
              <UserPlusIcon className="size-4.5" />
              Create Account
            </Button>
          </TransitionLink>

          <TransitionLink href="/login" className="block">
            <Button variant="outline" className="w-full h-12 text-base font-semibold gap-2" size="lg">
              <LogInIcon className="size-4.5" />
              Sign In
            </Button>
          </TransitionLink>
        </div>

        {/* Legal */}
        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
