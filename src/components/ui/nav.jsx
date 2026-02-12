"use client"

import { usePathname } from "@/i18n/navigation";
import { TransitionLink } from "@/components/ui/pageTransitions";
import { HomeIcon, ArrowRightLeftIcon, PaletteIcon, UserIcon, ShoppingCartIcon, TicketPercentIcon, GlobeIcon, BookOpen, ListOrderedIcon, LeafIcon, CircleHelpIcon, MessageCircleQuestionIcon, SmartphoneIcon, LaptopIcon, TabletIcon, GamepadIcon, HeadphonesIcon, WatchIcon, ShieldCheckIcon, TruckIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Separator } from "./separator";
import { ModeToggle } from "./modeToggle";
import { BottomSafeArea, useSafeArea } from "../safe-area";
import { useAuth } from "@/lib/auth";
import { XIcon } from "lucide-react";
import { useTransitionRouter } from "./pageTransitions";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';

export default function Nav({}) {
    const router = useTransitionRouter();
    const pathname = usePathname();
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');
    const [justOpenedPage, setJustOpenedPage] = useState();
    const [touchedLink, setTouchedLink] = useState();
    const navRef = useRef(null);
    const safeArea = useSafeArea();
    const { user, profileData, loading } = useAuth();

    // Helper function to check if a path is active
    const isActive = (path) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(path);
    };

    useEffect(() => {
        if (justOpenedPage === pathname) {
            setJustOpenedPage(null);
        }
    }, [justOpenedPage, pathname]);

    useEffect(() => {
        if (touchedLink === pathname) {
            setTouchedLink(null);
        }
    }, [touchedLink, pathname]);

    return (
        <>
            <nav 
                className="hidden sm:flex flex-col fixed top-0 left-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-10"
                style={{ 
                    viewTransitionName: 'nav-bar',
                    paddingTop: `${safeArea.top}px`
                }}
                ref={navRef}
            >
                {/* Top Layer - Main Navigation */}
                <div className="w-full h-12 px-4 flex items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
                        {/* Logo */}
                        <TransitionLink href="/" className="flex items-center flex-shrink-0">
                            <h1 className="font-bold text-lg tracking-tight">DepxTech</h1>
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
{/* Cart hidden - currently trade-in only
                            <TransitionLink href="/cart" className="relative p-1.5 hover:text-primary transition-colors">
                                <ShoppingCartIcon className="size-4.5" />
                            </TransitionLink>
*/}
                        </div>
                    </div>
                </div>

                {/* Second Layer - Trade-in Categories */}
                <div className="w-full h-10 px-4 flex items-center border-b border-border/50">
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

                {/* Third Layer - Secondary Links */}
                <div className="w-full h-8 px-4 flex items-center bg-muted/30">
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
                            <LanguageSwitcher variant="compact" />
                        </div>
                    </div>
                </div>
            </nav>
            <nav
                className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex sm:hidden z-10"
                onTouchEnd={() => setTouchedLink(null)}
                style={{
                    viewTransitionName: 'nav-bar-mobile',
                    paddingBottom: `${safeArea.bottom}px`
                }}
            >
                {[
                    { href: "/", icon: HomeIcon, label: t('home') },
                    { href: "/trade", icon: ArrowRightLeftIcon, label: t('tradeInMobile') },
                    { href: "/blog", icon: BookOpen, label: t('blog') },
                    { href: user ? "/account" : "/login", icon: UserIcon, label: user ? tCommon('account') : tCommon('signIn') },
                ].map(({ href, icon: Icon, label }) => {
                    const active = isActive(href)
                    const pressed = justOpenedPage === href || touchedLink === href
                    return (
                        <TransitionLink
                            key={href}
                            href={href}
                            className={cn(
                                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative',
                                active ? "text-primary" : "text-muted-foreground"
                            )}
                            hapticsOnPressRelease={true}
                            onClick={() => setJustOpenedPage(href)}
                            onTouchStart={() => setTouchedLink(href)}
                            onTouchMove={() => setTouchedLink(href)}
                        >
                            {active && (
                                <div
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                                    style={{ animation: 'fade-and-scale-in 0.3s ease-out' }}
                                />
                            )}
                            {href === (user ? "/account" : "/login") && !loading && user && profileData?.avatar && profileData?.avatar !== "default" ? (
                                <img
                                    src={profileData.avatar}
                                    alt="Profile"
                                    className={cn(
                                        "size-6 rounded-full object-cover",
                                        active && "ring-1.5 ring-primary ring-offset-1 ring-offset-background"
                                    )}
                                />
                            ) : (
                                <Icon
                                    strokeWidth={active || pressed ? 2 : 1.5}
                                    className="size-5"
                                    style={{
                                        transition: 'all 0.3s ease-out',
                                        transform: pressed ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                />
                            )}
                            <span className={cn(
                                "text-[0.625rem] leading-tight",
                                active ? "font-semibold" : "font-medium"
                            )}>
                                {label}
                            </span>
                        </TransitionLink>
                    )
                })}
            </nav>
            <BottomSafeArea/>
        </>
    )
}