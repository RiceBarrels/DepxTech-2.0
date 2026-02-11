"use client"

import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BadgeDollarSignIcon, ChevronRightIcon, InboxIcon, LogOutIcon, Package2Icon, PenIcon, SettingsIcon, TicketIcon, TicketPercentIcon, UserIcon } from 'lucide-react'
import { useTransitionRouter, isTransitionRoute } from '@/components/ui/pageTransitions'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import Recommends from '@/components/ui/recommends'
import { useSpring, useTransition, animated, useScroll, useInView } from '@react-spring/web'

export default function AccountPage() {
  const { user, loading, signOut, profileData } = useAuth()
  const transitionRouter = useTransitionRouter()
  const pathname = usePathname()

  const navigateWithTransition = async (href) => {
    // Set transition type before navigation
    const isTransition = isTransitionRoute(href)
    const isCurrentTransition = isTransitionRoute(pathname)
    
    if (isTransition || isCurrentTransition) {
      document.documentElement.classList.add('transition-slide')
      document.documentElement.classList.remove('transition-fade')
    } else {
      document.documentElement.classList.add('transition-fade')
      document.documentElement.classList.remove('transition-slide')
    }
    
    // Use transition router which handles view transitions
    await transitionRouter.push(href)
  }

  const recommendsSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 60 }
  })

  const handleProductClick = async (product) => {
    await navigateWithTransition(`/products/${product.id}`)
  }

  useEffect(() => {
    if (!loading && !user) {
      navigateWithTransition('/login')
    }
  }, [user, loading])

  if (loading) {
    return null
  }

  if (!user) {
    return null // This will redirect to login via useEffect
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back, {profileData?.full_name || user?.email || 'User'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-6 items-center">
          {/* user avatar */}
          { profileData?.avatar !== "default" && profileData?.avatar !== null && !loading ? 
            <img alt="user avatar" src={profileData?.avatar} className="w-24 h-24 rounded-full" /> : 
            <div className="w-24 h-24 rounded-full bg-foreground flex justify-center items-center">
              <UserIcon className="w-16 h-16 text-background" />
            </div>
          }
          
          {/* user name and email */}
          <div className='flex flex-col gap-1 items-center'>
            <h1 className='text-2xl font-bold text-foreground'>{profileData?.full_name || user?.email || 'User'}</h1>
            <p className='text-muted-foreground'>{profileData?.email || user?.email || 'User'}</p>
          </div>

          {/* edit */}
          <Button variant="outline" className='rounded-4xl w-32 h-12 text-base gap-4' onClick={() => navigateWithTransition('/account/edit')}>
            <PenIcon />Edit
          </Button>
        </div>

        <div className='flex justify-between items-center bg-accent/25 rounded-full overflow-hidden h-20 border-1'>
          <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none flex-5" onClick={() => navigateWithTransition('/account/orders')}>
            <Package2Icon strokeWidth={1.1} className='size-5'/>
            <span className='text-xs font-light'>Orders</span>
          </Button>

          <div className='h-14'><Separator orientation="vertical"/></div>

            <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none flex-4" onClick={() => navigateWithTransition('/account/membership')}>
              <BadgeDollarSignIcon strokeWidth={1.1} className='size-5'/>
              <span className='text-xs font-light'>Premium</span>
            </Button>

          <div className='h-14'><Separator orientation="vertical"/></div>

          <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none flex-4" onClick={() => navigateWithTransition('/offers')}>
            <TicketPercentIcon strokeWidth={1.1} className='size-5'/>
            <span className='text-xs font-light'>Offers</span>
          </Button>

          <div className='h-14'><Separator orientation="vertical"/></div>

          <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none flex-5" onClick={() => navigateWithTransition('/account/settings')}>
            <SettingsIcon strokeWidth={1.1} className='size-5'/>
            <span className='text-xs font-light'>Settings</span>
          </Button>
        </div>
        <div className='flex flex-col justify-center items-center bg-accent/25 light:bg-accent rounded-4xl overflow-hidden border-1'>
          <Button variant="ghost" className='w-full p-8 px-8 justify-start gap-4 rounded-none' onClick={() => navigateWithTransition('/account/inbox')}>
            <div><InboxIcon strokeWidth={1.1} className='size-5'/></div>
            <span className='font-normal text-base flex-1 flex justify-start items-center'>Inbox</span>
            <div><ChevronRightIcon className='size-4 text-muted-foreground'/></div>
          </Button>
          <div className='w-full px-6'><Separator orientation="horizontal"/></div>
          <Button variant="ghost" className='w-full p-8 px-8 justify-start gap-4 rounded-none items-center' onClick={() => navigateWithTransition('/account/membership/about')}>
            <div><BadgeDollarSignIcon strokeWidth={1.1} className='size-5'/></div>
            <span className='font-normal text-base flex-1 flex justify-start items-center'>Premium Membership</span>
            <div><ChevronRightIcon className='size-4 text-muted-foreground'/></div>
          </Button>
        </div>

        <div className='flex flex-col justify-center items-center bg-accent/25 light:bg-accent rounded-4xl overflow-hidden border-1'>
          <Button variant="ghost" className='w-full p-8 px-8 justify-start gap-4 rounded-none items-center text-destructive hover:text-destructive-foreground' onClick={signOut}>
            <div><LogOutIcon strokeWidth={1.1} className='size-5'/></div>
            <span className='font-normal text-base flex-1 flex justify-start items-center'>Sign out</span>
          </Button>
        </div>
      </div>
      {/* <animated.div style={recommendsSpring}>
        <Recommends 
          title="Trending Products"
          limit={12}
          className="mt-8"
          onProductClick={handleProductClick}
          initialProducts={[]}
        />
      </animated.div> */}
    </div>
  )
}