'use client'

import { usePathname } from 'next/navigation'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  ArrowRightLeftIcon,
  TicketPercentIcon,
  UsersIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon, exact: true },
  { href: '/admin/products', label: 'Products', icon: PackageIcon },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
  { href: '/admin/tradein', label: 'Trade-in', icon: ArrowRightLeftIcon },
  { href: '/admin/offers', label: 'Offers', icon: TicketPercentIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
]

function NavLinks({ onNavigate }) {
  const pathname = usePathname()
  const router = useTransitionRouter()

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(item)
        const Icon = item.icon
        return (
          <button
            key={item.href}
            onClick={() => {
              router.push(item.href)
              onNavigate?.()
            }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <PackageIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold text-lg">Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks />
      </div>

      <div className="border-t p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOutIcon className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false)
  const { signOut } = useAuth()

  return (
    <>
      <header className="lg:hidden flex items-center gap-3 border-b px-4 h-14 bg-background sticky top-0 z-30">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <PackageIcon className="h-4 w-4 text-primary" />
          <span className="font-semibold">Admin</span>
        </div>
      </header>

      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerContent className="h-full">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Admin</span>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <XIcon className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>

          <div className="border-t p-3">
            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOutIcon className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
