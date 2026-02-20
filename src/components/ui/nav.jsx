"use client"

import { usePathname } from "@/i18n/navigation";
import { TransitionLink } from "@/components/ui/pageTransitions";
import { HomeIcon, ArrowRightLeftIcon, PaletteIcon, UserIcon, ShoppingCartIcon, TicketPercentIcon, GlobeIcon, BookOpen, ListOrderedIcon, LeafIcon, CircleHelpIcon, MessageCircleQuestionIcon, SmartphoneIcon, LaptopIcon, TabletIcon, GamepadIcon, HeadphonesIcon, WatchIcon, ShieldCheckIcon, TruckIcon, RotateCcwIcon, MenuIcon, XIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Separator } from "./separator";
import { ModeToggle } from "./modeToggle";
import { useSafeArea } from "../safe-area";
import { useAuth } from "@/lib/auth";
import { useTransitionRouter } from "./pageTransitions";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { heavyHapticsImpact } from "@/lib/haptics";
import { NavSearch } from "./NavSearch";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerClose,
} from "./drawer";

export default function Nav({layers = 3}) {
    const router = useTransitionRouter();
    const pathname = usePathname();
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');
    const navRef = useRef(null);
    const safeArea = useSafeArea();
    const { user, profileData, loading } = useAuth();

    const [drawerOpen, setDrawerOpen] = useState(false)

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false)
    }, [pathname])

    // Helper function to check if a path is active
    const isActive = (path) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(path);
    };

    const mobileNavLinks = [
        { href: "/", icon: HomeIcon, label: t('home') },
        { href: "/trade", icon: ArrowRightLeftIcon, label: t('tradeIn') },
        { href: "/trade/process", icon: ListOrderedIcon, label: t('process') },
        { href: "/trade/how-it-works", icon: CircleHelpIcon, label: t('howItWorks') },
        { href: "/trade/faq", icon: MessageCircleQuestionIcon, label: t('faq') },
        { href: "/blog", icon: BookOpen, label: t('blog') },
        { href: "/offers", icon: TicketPercentIcon, label: tCommon('offers') || 'Offers' },
    ]

    const mobileCategoryLinks = [
        { href: "/trade?category=smartphones", icon: SmartphoneIcon, label: t('categories.smartphones') },
        { href: "/trade?category=laptops", icon: LaptopIcon, label: t('categories.laptops') },
        { href: "/trade?category=tablets", icon: TabletIcon, label: t('categories.tablets') },
        { href: "/trade?category=gaming", icon: GamepadIcon, label: t('categories.gamingConsoles') },
        { href: "/trade?category=audio", icon: HeadphonesIcon, label: t('categories.audioDevices') },
        { href: "/trade?category=wearables", icon: WatchIcon, label: t('categories.wearables') },
    ]

    return (
        <>
            {/* ── Desktop Navigation ── */}
            <nav
                className="hidden sm:flex flex-col sticky top-0 left-0 w-full bg-background z-100"
                style={{
                    viewTransitionName: 'nav-bar',
                    paddingTop: `${safeArea.top}px`
                }}
                ref={navRef}
            >
                {/* Top Layer - Main Navigation */}
                <div className="w-full h-16 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
                        {/* Logo */}
                        <TransitionLink href="/" className="flex items-center flex-shrink-0">
                            <h1 className="font-black text-3xl tracking-tight">DepxTech</h1>
                        </TransitionLink>

                        {/* Center Navigation - Trade-in Focus */}
                        <div className="flex items-center gap-5 flex-1 justify-center">
                            <TransitionLink
                                href="/trade"
                                className={cn(
                                    "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                                    isActive("/trade") ? "text-primary" : "text-muted-foreground"
                                )}
                                data-active={isActive("/trade")}
                            >
                                <ArrowRightLeftIcon className="size-3.5" />
                                {t('tradeIn')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade/process"
                                className={cn(
                                    "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                                    pathname.includes("process") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <ListOrderedIcon className="size-3.5" />
                                {t('process')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade/sustainability"
                                className={cn(
                                    "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                                    pathname.includes("sustainability") ? "text-emerald-500" : "text-muted-foreground"
                                )}
                            >
                                <LeafIcon className="size-3.5" />
                                {t('sustainability')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade/how-it-works"
                                className={cn(
                                    "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                                    pathname.includes("how-it-works") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <CircleHelpIcon className="size-3.5" />
                                {t('howItWorks')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade/faq"
                                className={cn(
                                    "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                                    pathname.includes("faq") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <MessageCircleQuestionIcon className="size-3.5" />
                                {t('faq')}
                            </TransitionLink>
                            <TransitionLink
                                href="/blog"
                                className={cn(
                                    "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                                    isActive("/blog") ? "text-primary" : "text-muted-foreground"
                                )}
                                data-active={isActive("/blog")}
                            >
                                <BookOpen className="size-3.5" />
                                {t('blog')}
                            </TransitionLink>
                        </div>

                        {/* Search */}
                        <NavSearch className="w-56 xl:w-64 flex-shrink-0" />

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {!loading && user ? (
                                <TransitionLink href="/account" className="flex items-center justify-center">
                                    {profileData?.avatar && profileData?.avatar !== "default" ? (
                                        <img
                                            src={profileData.avatar}
                                            alt="Profile"
                                            className="size-7 rounded-full object-cover border border-border hover:border-primary transition-colors"
                                        />
                                    ) : (
                                        <div className="size-7 rounded-full bg-muted flex items-center justify-center border border-border hover:border-primary transition-colors">
                                            <UserIcon className="size-3.5 text-muted-foreground" />
                                        </div>
                                    )}
                                </TransitionLink>
                            ) : !loading ? (
                                <TransitionLink href="/login">
                                    <Button variant="ghost" size="sm" className="h-8 px-2.5 gap-1.5 text-sm">
                                        <UserIcon className="size-3.5" />
                                        <span className="hidden xl:inline">{tCommon('signIn')}</span>
                                    </Button>
                                </TransitionLink>
                            ) : (
                                <div className="size-7 rounded-full bg-muted animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>
                {/* Second Layer - Trade-in Categories */}
                {layers > 1 && (
                    <div className="w-full h-10 px-4 flex items-center">
                        <div className="flex items-center gap-5 max-w-7xl mx-auto w-full overflow-x-auto">
                            <TransitionLink
                                href="/trade?category=smartphones"
                                className={cn(
                                    "text-xs font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1",
                                    pathname.includes("smartphones") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <SmartphoneIcon className="size-3" />
                                {t('categories.smartphones')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade?category=laptops"
                                className={cn(
                                    "text-xs font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1",
                                    pathname.includes("laptops") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <LaptopIcon className="size-3" />
                                {t('categories.laptops')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade?category=tablets"
                                className={cn(
                                    "text-xs font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1",
                                    pathname.includes("tablets") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <TabletIcon className="size-3" />
                                {t('categories.tablets')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade?category=gaming"
                                className={cn(
                                    "text-xs font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1",
                                    pathname.includes("gaming") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <GamepadIcon className="size-3" />
                                {t('categories.gamingConsoles')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade?category=audio"
                                className={cn(
                                    "text-xs font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1",
                                    pathname.includes("audio") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <HeadphonesIcon className="size-3" />
                                {t('categories.audioDevices')}
                            </TransitionLink>
                            <TransitionLink
                                href="/trade?category=wearables"
                                className={cn(
                                    "text-xs font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1",
                                    pathname.includes("wearables") ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <WatchIcon className="size-3" />
                                {t('categories.wearables')}
                            </TransitionLink>
                        </div>
                    </div>
                )}

                {/* Third Layer - Secondary Links */}
                {layers > 2 && (
                    <div className="w-full h-8 px-4 flex items-center shadow-[0_24px_36px_var(--background)]">
                        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full text-xs text-muted-foreground">
                            <TransitionLink href="/warranty" className="hover:text-foreground transition-colors flex items-center gap-1">
                                <ShieldCheckIcon className="size-3" />
                                {t('warranty')}
                            </TransitionLink>
                            <TransitionLink href="/shipping" className="hover:text-foreground transition-colors flex items-center gap-1">
                                <TruckIcon className="size-3" />
                                {t('freeShipping')}
                            </TransitionLink>
                            <TransitionLink href="/returns" className="hover:text-foreground transition-colors flex items-center gap-1">
                                <RotateCcwIcon className="size-3" />
                                {t('returns')}
                            </TransitionLink>
                            <div className="ml-auto">
                                <div>
                                    <LanguageSwitcher variant="compact" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── Mobile Top Header (two layers) ── */}
            <nav
                className="sticky top-0 left-0 right-0 bg-background/95 backdrop-blur-md flex sm:hidden flex-col z-100 gap-2"
                style={{
                    viewTransitionName: 'nav-bar-mobile',
                    paddingTop: `${safeArea.top}px`,
                }}
            >
                {/* Layer 1: Logo + Account + Hamburger */}
                <div className="flex items-center justify-between h-11 px-4">
                    <TransitionLink href="/" className="flex items-center shrink-0">
                        <h1 className="font-black text-xl tracking-tight">DepxTech</h1>
                    </TransitionLink>

                    <div className="flex items-center gap-1">
                        {!loading && user ? (
                            <TransitionLink href="/account" className="p-2">
                                {profileData?.avatar && profileData?.avatar !== "default" ? (
                                    <img
                                        src={profileData.avatar}
                                        alt="Profile"
                                        className="size-6 rounded-full object-cover border border-border"
                                    />
                                ) : (
                                    <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                                        <UserIcon className="size-3.5 text-muted-foreground" />
                                    </div>
                                )}
                            </TransitionLink>
                        ) : !loading ? (
                            <TransitionLink href="/login" className="p-2">
                                <UserIcon className="size-5 text-muted-foreground" />
                            </TransitionLink>
                        ) : null}

                        <button
                            onClick={() => { setDrawerOpen(true); heavyHapticsImpact() }}
                            className="p-2 -mr-2 text-foreground"
                            aria-label="Open menu"
                        >
                            <MenuIcon className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Layer 2: Search bar */}
                {layers > 1 && (
                    <div className="px-3 pb-2  shadow-[0_24px_36px_var(--background)]">
                        <NavSearch className="w-full" />
                    </div>
                )}
            </nav>

            {/* ── Mobile Drawer Menu ── */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
                <DrawerContent
                    className="h-full w-[280px] ml-auto rounded-none"
                    showCloseButton={false}
                >
                    <DrawerHeader className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <DrawerTitle className="font-bold text-lg">Menu</DrawerTitle>
                        <DrawerClose asChild>
                            <button className="p-1.5 rounded-md hover:bg-muted transition-colors" aria-label="Close menu">
                                <XIcon className="size-5" />
                            </button>
                        </DrawerClose>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto py-2">
                        {/* Main links */}
                        <div className="px-2">
                            {mobileNavLinks.map(({ href, icon: Icon, label }) => (
                                <TransitionLink
                                    key={href}
                                    href={href}
                                    onClick={() => setDrawerOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                        isActive(href)
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {label}
                                    {isActive(href) && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </TransitionLink>
                            ))}
                        </div>

                        <Separator className="my-2" />

                        {/* Categories */}
                        <div className="px-2">
                            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('tradeIn')}
                            </p>
                            {mobileCategoryLinks.map(({ href, icon: Icon, label }) => (
                                <TransitionLink
                                    key={href}
                                    href={href}
                                    onClick={() => setDrawerOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <Icon className="size-3.5" />
                                    {label}
                                    <ChevronRightIcon className="size-3.5 ml-auto opacity-40" />
                                </TransitionLink>
                            ))}
                        </div>

                        <Separator className="my-2" />

                        {/* Secondary links */}
                        <div className="px-2">
                            <TransitionLink
                                href="/trade/sustainability"
                                onClick={() => setDrawerOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <LeafIcon className="size-3.5" />
                                {t('sustainability')}
                            </TransitionLink>
                            <TransitionLink
                                href="/warranty"
                                onClick={() => setDrawerOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <ShieldCheckIcon className="size-3.5" />
                                {t('warranty')}
                            </TransitionLink>
                            <TransitionLink
                                href="/shipping"
                                onClick={() => setDrawerOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <TruckIcon className="size-3.5" />
                                {t('freeShipping')}
                            </TransitionLink>
                        </div>

                        <Separator className="my-2" />

                        {/* Language + Theme */}
                        <div className="px-5 py-2 flex items-center justify-between">
                            <LanguageSwitcher variant="compact" />
                            <ModeToggle />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}
