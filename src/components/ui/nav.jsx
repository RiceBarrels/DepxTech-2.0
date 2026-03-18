"use client"

import { usePathname } from "@/i18n/navigation";
import { TransitionLink } from "@/components/ui/pageTransitions";
import { HomeIcon, ArrowRightLeftIcon, UserIcon, ShoppingCartIcon, TicketPercentIcon, BookOpen, ListOrderedIcon, LeafIcon, CircleHelpIcon, MessageCircleQuestionIcon, SmartphoneIcon, LaptopIcon, TabletIcon, GamepadIcon, HeadphonesIcon, WatchIcon, ShieldCheckIcon, TruckIcon, RotateCcwIcon, MenuIcon, ChevronRightIcon, ChevronDownIcon, ChevronLeftIcon, ArrowRightIcon, ShoppingBagIcon, InfoIcon, LifeBuoyIcon, MailIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./button";
import { Separator } from "./separator";
import { ModeToggle } from "./modeToggle";
import { useSafeArea } from "../safe-area";
import { useAuth } from "@/lib/auth";
import { useTransitionRouter } from "./pageTransitions";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { NavSearch } from "./NavSearch";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "./drawer";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence } from "framer-motion";
import { isPWA } from "@/lib/isPWA";

// ── Mega-menu data ──
function useMegaMenuData(t, tCommon) {
    return {
        trade: {
            label: t('tradeIn'),
            sections: [
                {
                    title: "Browse by Category",
                    links: [
                        { href: "/trade?category=smartphones", icon: SmartphoneIcon, label: t('categories.smartphones') },
                        { href: "/trade?category=laptops", icon: LaptopIcon, label: t('categories.laptops') },
                        { href: "/trade?category=tablets", icon: TabletIcon, label: t('categories.tablets') },
                        { href: "/trade?category=gaming", icon: GamepadIcon, label: t('categories.gamingConsoles') },
                        { href: "/trade?category=audio", icon: HeadphonesIcon, label: t('categories.audioDevices') },
                        { href: "/trade?category=wearables", icon: WatchIcon, label: t('categories.wearables') },
                    ],
                },
                {
                    title: "Resources",
                    links: [
                        { href: "/trade", icon: ArrowRightLeftIcon, label: "Trade Hub" },
                        { href: "/trade/how-it-works", icon: CircleHelpIcon, label: t('howItWorks') },
                        { href: "/trade/process", icon: ListOrderedIcon, label: t('process') },
                        { href: "/trade/faq", icon: MessageCircleQuestionIcon, label: t('faq') },
                        { href: "/trade/sustainability", icon: LeafIcon, label: t('sustainability') },
                    ],
                },
            ],
            featured: {
                title: "Get up to ",
                desc: "for your old device",
                href: "/trade",
                cta: "Start Trading",
                gradient: "from-violet-500 to-indigo-600",
            },
        },
        shop: {
            label: "Shop",
            sections: [
                {
                    title: "Shopping",
                    links: [
                        { href: "/products", icon: ShoppingBagIcon, label: "All Products" },
                        { href: "/offers", icon: TicketPercentIcon, label: tCommon('offers') || "Offers" },
                        { href: "/cart", icon: ShoppingCartIcon, label: tCommon('cart') || "Cart" },
                    ],
                },
            ],
            featured: {
                title: "New Arrivals",
                desc: "Premium refurbished tech",
                href: "/products",
                cta: "Browse Collection",
                gradient: "from-emerald-500 to-teal-600",
            },
        },
        about: {
            label: "About",
            sections: [
                {
                    title: "Company",
                    links: [
                        { href: "/about", icon: InfoIcon, label: "About Us" },
                        { href: "/blog", icon: BookOpen, label: t('blog') },
                        { href: "/deephuo", icon: LeafIcon, label: "Deephuo" },
                    ],
                },
            ],
            featured: {
                title: "Our Story",
                desc: "Sustainable electronics, reimagined",
                href: "/about",
                cta: "Learn More",
                gradient: "from-amber-500 to-orange-600",
            },
        },
        help: {
            label: "Help",
            sections: [
                {
                    title: "Support",
                    links: [
                        { href: "/help", icon: LifeBuoyIcon, label: "Help Center" },
                        { href: "/support", icon: MessageCircleQuestionIcon, label: "Chat Now" },
                        { href: "/shipping", icon: TruckIcon, label: t('freeShipping') },
                        { href: "/warranty", icon: ShieldCheckIcon, label: t('warranty') },
                        { href: "/returns", icon: RotateCcwIcon, label: t('returns') },
                    ],
                },
            ],
            info: {
                hours: "Mon–Fri, 9 AM – 6 PM",
                email: "support@depxtech.com",
            },
        },
    }
}

// ── Mega-menu panel ──
function MegaMenuPanel({ menu, onLinkClick }) {
    const hasTwoCols = menu.sections.length > 1
    return (
        <div className={cn(
            "grid gap-8",
            menu.info
                ? "grid-cols-[1fr_auto]"
                : hasTwoCols
                    ? "grid-cols-[1fr_1fr_auto]"
                    : "grid-cols-[1fr_auto]"
        )}>
            {menu.sections.map((section) => (
                <div key={section.title}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        {section.title}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                        {section.links.map(({ href, icon: Icon, label }) => (
                            <TransitionLink
                                key={href}
                                href={href}
                                onClick={onLinkClick}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors group"
                            >
                                {Icon && <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                                <span className="group-hover:text-foreground transition-colors">{label}</span>
                            </TransitionLink>
                        ))}
                    </div>
                </div>
            ))}

            {/* Featured card */}
            {menu.featured && (
                <TransitionLink
                    href={menu.featured.href}
                    onClick={onLinkClick}
                    className="w-56 rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-colors group"
                >
                    <div className={`bg-gradient-to-br ${menu.featured.gradient} p-5 text-white`}>
                        <p className="text-lg font-bold leading-tight">{menu.featured.title}</p>
                        <p className="text-sm opacity-80 mt-1">{menu.featured.desc}</p>
                    </div>
                    <div className="px-5 py-3 bg-background flex items-center justify-between">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{menu.featured.cta}</span>
                        <ArrowRightIcon className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                </TransitionLink>
            )}

            {/* Info card (help panel) */}
            {menu.info && (
                <div className="w-52 rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClockIcon className="size-3.5 shrink-0" />
                        <span>{menu.info.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="size-3.5 shrink-0" />
                        <span>{menu.info.email}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Main Nav ──
export default function Nav({ layers = 3 }) {
    const router = useTransitionRouter();
    const pathname = usePathname();
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');
    const navRef = useRef(null);
    const safeArea = useSafeArea();
    const { user, profileData, loading } = useAuth();
    const { trigger } = useWebHaptics();

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isFixed, setIsFixed] = useState(false)
    const [isPwaMode, setIsPwaMode] = useState(false)

    // Mega-menu state
    const [activeMenu, setActiveMenu] = useState(null)
    const menuCloseTimer = useRef(null)
    const megaMenuData = useMegaMenuData(t, tCommon)
    const menuKeys = ['trade', 'shop', 'about', 'help']

    // Mobile drawer sub-panel state
    const [drawerSection, setDrawerSection] = useState(null)

    // Detect PWA mode on mount
    useEffect(() => {
        setIsPwaMode(isPWA())
    }, [])

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false)
        setDrawerSection(null)
    }, [pathname])

    useEffect(() => {
        if (!drawerOpen) {
            trigger([
                { duration: 100, intensity: 1 },
                { delay: 120, duration: 30, intensity: 1 },
            ])
        }
    }, [drawerOpen])

    // Hide mega-menu on scroll + toggle fixed styling
    useEffect(() => {
        const el = document.getElementById('scrollable-content')
        if (!el) return
        const onScroll = () => {
            const y = el.scrollTop
            setScrolled(y > 1)
            setIsFixed(y > 1)
            if (y > 1) setActiveMenu(null)
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    const isActive = (path) => {
        if (path === "/") return pathname === "/"
        return pathname.startsWith(path)
    }

    // Mega-menu handlers
    const handleMenuEnter = useCallback((key) => {
        if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
        setActiveMenu(key)
    }, [])

    const handleMenuLeave = useCallback(() => {
        menuCloseTimer.current = setTimeout(() => setActiveMenu(null), 150)
    }, [])

    const closeMegaMenu = useCallback(() => setActiveMenu(null), [])

    return (
        <>
            {/* ── Desktop Navigation ── */}
            <motion.nav
                animate={{
                    marginLeft: isFixed ? 16 : 0,
                    marginRight: isFixed ? 16 : 0,
                    marginTop: isFixed ? 16 : 0,
                    marginBottom: isFixed ? 16 : 0,
                    borderRadius: isFixed ? 32 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "hidden sm:flex flex-col z-100 backdrop-blur-lg sticky top-0",
                    isFixed
                        ? "border-t border-l border-primary/20 shadow bg-primary/10 top-2"
                        : ""
                )}
                style={{
                    viewTransitionName: 'nav-bar',
                    paddingTop: `${safeArea.top}px`
                }}
                ref={navRef}
                onMouseLeave={handleMenuLeave}
            >
                {/* Main Bar */}
                <div className="w-full h-16 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
                        {/* Logo */}
                        <TransitionLink href="/" className="flex items-center flex-shrink-0">
                            <h1 className="font-black text-3xl tracking-tight">DepxTech</h1>
                        </TransitionLink>

                        {/* Mega-Menu Triggers */}
                        <div className="flex items-center gap-1 flex-1 justify-center">
                            {menuKeys.map((key) => (
                                <button
                                    key={key}
                                    onMouseEnter={() => handleMenuEnter(key)}
                                    onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        activeMenu === key
                                            ? "text-primary bg-primary/5"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {megaMenuData[key].label}
                                    <ChevronDownIcon className={cn(
                                        "size-3.5 transition-transform duration-200",
                                        activeMenu === key && "rotate-180"
                                    )} />
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <NavSearch className="w-56 xl:w-64 flex-shrink-0" />

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <LanguageSwitcher variant="compact" />

                            {!loading && user ? (
                                <TransitionLink href="/account" className="flex items-center justify-center">
                                    {profileData?.avatar && profileData?.avatar !== "default" ? (
                                        <img
                                            src={profileData.avatar}
                                            alt="Profile"
                                            className="size-8 rounded-full object-cover border border-border hover:border-primary transition-colors"
                                        />
                                    ) : (
                                        <div className="size-8 rounded-full bg-muted flex items-center justify-center border border-border hover:border-primary transition-colors">
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

                {/* ── Mega-Menu Dropdown Panels ── */}
                <AnimatePresence>
                    {activeMenu && megaMenuData[activeMenu] && (
                        <motion.div
                            key={activeMenu}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 z-50"
                            onMouseEnter={() => {
                                if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
                            }}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className="bg-background/95 backdrop-blur-xl border-b border-border shadow-xl">
                                <div className="max-w-7xl mx-auto px-8 py-6">
                                    <MegaMenuPanel
                                        menu={megaMenuData[activeMenu]}
                                        onLinkClick={closeMegaMenu}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* ── Mobile Top Header — hidden in PWA mode ── */}
            {!isPwaMode && <motion.nav
                animate={{
                    marginLeft: isFixed ? 16 : 0,
                    marginRight: isFixed ? 16 : 0,
                    marginTop: isFixed ? 16 : 0,
                    marginBottom: isFixed ? 16 : 0,
                    borderRadius: isFixed ? 24 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "flex sm:hidden flex-col z-100 gap-2 backdrop-blur-lg sticky top-0",
                    isFixed
                        ? "border-l border-t border-primary/20 shadow bg-primary/10 top-2"
                        : ""
                )}
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

                        <Button
                            onClick={() => {
                                setDrawerOpen(true);
                                trigger([
                                    { duration: 100, intensity: 1 },
                                    { delay: 120, duration: 30, intensity: 1 },
                                ])
                            }}
                            className="p-2 -mr-2 text-foreground"
                            variant="ghost"
                            size="icon"
                            aria-label="Open menu"
                            doHaptic={false}
                        >
                            <MenuIcon className="size-5" />
                        </Button>
                    </div>
                </div>

                {/* Layer 2: Search bar - collapse on scroll */}
                {layers > 1 && (
                    <div
                        className="grid"
                        style={{
                            gridTemplateRows: scrolled ? '0fr' : '1fr',
                            opacity: scrolled ? 0 : 1,
                            transition: 'grid-template-rows 300ms ease, opacity 200ms ease',
                        }}
                    >
                        <div className="overflow-hidden">
                            <div className="px-3 pb-2 shadow-[0_24px_36px_var(--background)]">
                                <NavSearch className="w-full" />
                            </div>
                        </div>
                    </div>
                )}
            </motion.nav>}

            {/* ── Mobile Drawer Menu with Sub-Panels ── */}
            <Drawer open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setDrawerSection(null) }} direction="right">
                <DrawerContent
                    className="h-full w-[280px] ml-auto border-none rounded-xl rounded-r-none p-2 shadow-2xl z-101"
                    showCloseButton={false}
                >
                    <DrawerHeader className="flex items-center justify-between px-4 py-3">
                        <DrawerTitle>DepxTech</DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-hidden relative">
                        {/* Main Panel */}
                        <div
                            className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-2 transition-transform duration-250 ease-out"
                            style={{ transform: drawerSection ? 'translateX(-100%)' : 'translateX(0)' }}
                        >
                            {/* Home link */}
                            <TransitionLink
                                href="/"
                                onClick={() => setDrawerOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                                    isActive("/") && pathname === "/"
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-foreground hover:bg-muted"
                                )}
                            >
                                <HomeIcon className="size-4" />
                                {t('home')}
                            </TransitionLink>

                            {/* Section buttons */}
                            {menuKeys.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setDrawerSection(key)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    <span className="font-medium">{megaMenuData[key].label}</span>
                                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                                </button>
                            ))}

                            <Separator className="my-2 mx-2" />

                            {/* Language + Theme */}
                            <div className="py-2 px-2 flex items-center justify-between">
                                <LanguageSwitcher variant="compact" />
                                <ModeToggle />
                            </div>
                        </div>

                        {/* Sub-Panel */}
                        <div
                            className="absolute inset-0 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-2 transition-transform duration-250 ease-out"
                            style={{ transform: drawerSection ? 'translateX(0)' : 'translateX(100%)' }}
                        >
                            {drawerSection && megaMenuData[drawerSection] && (
                                <>
                                    {/* Back button */}
                                    <button
                                        onClick={() => setDrawerSection(null)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <ChevronLeftIcon className="size-4" />
                                        {tCommon('back') || 'Back'}
                                    </button>

                                    {/* Section title */}
                                    <div className="px-3 py-1">
                                        <h3 className="text-base font-bold">{megaMenuData[drawerSection].label}</h3>
                                    </div>

                                    {/* Links by section */}
                                    {megaMenuData[drawerSection].sections.map((section) => (
                                        <div key={section.title}>
                                            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {section.title}
                                            </p>
                                            {section.links.map(({ href, icon: Icon, label }) => (
                                                <TransitionLink
                                                    key={href}
                                                    href={href}
                                                    onClick={() => { setDrawerOpen(false); setDrawerSection(null) }}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                >
                                                    {Icon && <Icon className="size-3.5" />}
                                                    {label}
                                                </TransitionLink>
                                            ))}
                                        </div>
                                    ))}

                                    {/* Featured card in drawer */}
                                    {megaMenuData[drawerSection].featured && (
                                        <TransitionLink
                                            href={megaMenuData[drawerSection].featured.href}
                                            onClick={() => { setDrawerOpen(false); setDrawerSection(null) }}
                                            className="mx-2 mt-2 rounded-xl overflow-hidden border border-border"
                                        >
                                            <div className={`bg-gradient-to-br ${megaMenuData[drawerSection].featured.gradient} p-4 text-white`}>
                                                <p className="font-bold">{megaMenuData[drawerSection].featured.title}</p>
                                                <p className="text-xs opacity-80 mt-0.5">{megaMenuData[drawerSection].featured.desc}</p>
                                            </div>
                                            <div className="px-4 py-2 bg-background flex items-center justify-between">
                                                <span className="text-xs font-medium">{megaMenuData[drawerSection].featured.cta}</span>
                                                <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                                            </div>
                                        </TransitionLink>
                                    )}

                                    {/* Info card (help section) */}
                                    {megaMenuData[drawerSection].info && (
                                        <div className="mx-2 mt-2 rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <ClockIcon className="size-3 shrink-0" />
                                                <span>{megaMenuData[drawerSection].info.hours}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MailIcon className="size-3 shrink-0" />
                                                <span>{megaMenuData[drawerSection].info.email}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* ── PWA Bottom Tab Bar ── */}
            {isPwaMode && (
                <nav
                    className="fixed bottom-4 left-6 right-6 sm:hidden z-999 backdrop-blur-lg bg-primary/10 rounded-2xl border-t border-l border-primary/20 shadow p-1"
                    style={{ viewTransitionName: 'pwa-tab-bar' }}
                >
                    <div className="flex items-stretch h-12 gap-1">
                        {[
                            { href: "/", icon: HomeIcon, label: t('home') },
                            { href: "/trade", icon: ArrowRightLeftIcon, label: t('tradeIn') },
                            { href: "/cart", icon: ShoppingCartIcon, label: tCommon('cart') || 'Cart' },
                            { href: user ? "/account" : "/login", icon: UserIcon, label: tCommon('account') || 'Account' },
                        ].map(({ href, icon: Icon, label }) => {
                            const active = isActive(href)
                            return (
                                <motion.button
                                    key={href}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    onClick={() => {
                                        trigger([
                                            { duration: 30 },
                                            { delay: 60, duration: 40, intensity: 1 },
                                        ])
                                        setTimeout(() => {
                                            router.push(href)
                                        }, 100)
                                    }}
                                    className={cn(
                                        "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl relative",
                                        active ? "text-primary" : "text-foreground"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="pwa-tab-active"
                                            className="absolute inset-0 bg-gray-300/20 dark:bg-gray-200/10 rounded-2xl"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={cn("size-5 relative z-10", active && "stroke-[2.5px]")} />
                                    <span className="text-[10px] font-medium relative z-10">{label}</span>
                                </motion.button>
                            )
                        })}
                    </div>
                </nav>
            )}
        </>
    )
}
