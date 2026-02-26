"use client"

import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowRightLeftIcon, BadgeDollarSignIcon, ChevronRightIcon, InboxIcon, LogOutIcon, Package2Icon, PenIcon, SettingsIcon, TicketPercentIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Separator } from '@/components/ui/separator'
import { useSpring } from '@react-spring/web'
import { useRouter } from '@/i18n/navigation'

export default function AccountPage() {
  const t = useTranslations('account')
  const { user, loading, signOut, profileData } = useAuth()
  const router = useRouter();

  const recommendsSpring = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 60 }
  })

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count || 0))
  }, [user])

  if (loading) {
    return null
  }

  if (!user) {
    return null // This will redirect to login via useEffect
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('myAccount')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeBack', { name: profileData?.full_name || user?.email || 'User' })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-8">
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
          <TransitionLink href="/account/edit">
            <Button variant="outline" className='rounded-4xl w-32 h-12 text-base gap-4'>
              <PenIcon />{t('edit')}
            </Button>
          </TransitionLink>
        </div>

        <div className='flex justify-between items-center bg-accent/25 rounded-full overflow-hidden h-20 border-1'>
          <TransitionLink href="/account/orders" className="flex-5">
            <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none w-full">
              <Package2Icon strokeWidth={1.1} className='size-5'/>
              <span className='text-xs font-light'>{t('orders')}</span>
            </Button>
          </TransitionLink>

          <div className='h-14'><Separator orientation="vertical"/></div>

          <TransitionLink href="/account/membership" className="flex-4">
            <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none w-full">
              <BadgeDollarSignIcon strokeWidth={1.1} className='size-5'/>
              <span className='text-xs font-light'>{t('premium')}</span>
            </Button>
          </TransitionLink>

          <div className='h-14'><Separator orientation="vertical"/></div>

          <TransitionLink href="/offers" className="flex-4">
            <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none w-full">
              <TicketPercentIcon strokeWidth={1.1} className='size-5'/>
              <span className='text-xs font-light'>{t('offers')}</span>
            </Button>
          </TransitionLink>

          <div className='h-14'><Separator orientation="vertical"/></div>

          <TransitionLink href="/account/settings" className="flex-5">
            <Button variant="ghost" className="flex flex-col gap-1 items-center h-20 rounded-none w-full">
              <SettingsIcon strokeWidth={1.1} className='size-5'/>
              <span className='text-xs font-light'>{t('settings')}</span>
            </Button>
          </TransitionLink>
        </div>
        <div className='flex flex-col justify-center items-center bg-accent/25 light:bg-accent rounded-4xl overflow-hidden border-1'>
          <TransitionLink href="/account/inbox" className="w-full">
            <Button variant="ghost" className='w-full py-4 px-6 sm:p-8 sm:px-8 justify-start gap-4 rounded-none'>
              <div className="relative">
                <InboxIcon strokeWidth={1.1} className='size-5'/>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className='font-normal text-base flex-1 flex justify-start items-center'>{t('inbox')}</span>
              <div><ChevronRightIcon className='size-4 text-muted-foreground'/></div>
            </Button>
          </TransitionLink>
          <div className='w-full px-6'><Separator orientation="horizontal"/></div>
          <TransitionLink href="/account/membership/about" className="w-full">
            <Button variant="ghost" className='w-full py-4 px-6 sm:p-8 sm:px-8 justify-start gap-4 rounded-none items-center'>
              <div><BadgeDollarSignIcon strokeWidth={1.1} className='size-5'/></div>
              <span className='font-normal text-base flex-1 flex justify-start items-center'>{t('premiumMembership')}</span>
              <div><ChevronRightIcon className='size-4 text-muted-foreground'/></div>
            </Button>
          </TransitionLink>
          <div className='w-full px-6'><Separator orientation="horizontal"/></div>
          <TransitionLink href="/account/trade-ins" className="w-full">
            <Button variant="ghost" className='w-full py-4 px-6 sm:p-8 sm:px-8 justify-start gap-4 rounded-none items-center'>
              <div><ArrowRightLeftIcon strokeWidth={1.1} className='size-5'/></div>
              <span className='font-normal text-base flex-1 flex justify-start items-center'>{t('myTradeIns')}</span>
              <div><ChevronRightIcon className='size-4 text-muted-foreground'/></div>
            </Button>
          </TransitionLink>
        </div>

        <div className='flex flex-col justify-center items-center bg-accent/25 light:bg-accent rounded-4xl overflow-hidden border-1'>
          <Button variant="ghost" className='w-full py-4 px-6 sm:p-8 sm:px-8 justify-start gap-4 rounded-none items-center text-destructive hover:text-destructive-foreground' onClick={signOut}>
            <div><LogOutIcon strokeWidth={1.1} className='size-5'/></div>
            <span className='font-normal text-base flex-1 flex justify-start items-center'>{t('signOut')}</span>
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