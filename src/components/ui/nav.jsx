"use client"

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/ui/pageTransitions";
import { HomeIcon, ArrowRightLeftIcon, PaletteIcon, UserIcon, ShoppingCartIcon, TicketPercentIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextSearchIcon } from "lucide-react";
import { SearchIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Separator } from "./separator";
import { ModeToggle } from "./modeToggle";
import { BottomSafeArea, useSafeArea } from "../safe-area";

export default function Nav({}) {
    const pathname = usePathname();
    const [justOpenedPage, setJustOpenedPage] = useState();
    const [touchedLink, setTouchedLink] = useState();
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const navRef = useRef(null);
    const safeArea = useSafeArea();

    // Helper function to check if a path is active
    const isActive = (path) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(path);
    };

    // Update indicator position for desktop nav
    useEffect(() => {
        const updateIndicator = () => {
            if (navRef.current) {
                const activeLink = navRef.current.querySelector('a[data-active="true"]');
                if (activeLink) {
                    const navRect = navRef.current.getBoundingClientRect();
                    const linkRect = activeLink.getBoundingClientRect();
                    setIndicatorStyle({
                        left: `${linkRect.left - navRect.left}px`,
                        width: `${linkRect.width}px`,
                        opacity: 1,
                    });
                } else {
                    // Hide indicator if no active link
                    setIndicatorStyle({
                        opacity: 0,
                    });
                }
            }
        };
        
        updateIndicator();
        // Update on window resize
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [pathname]);

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
                ref={navRef}
                className="w-full overflow-hidden px-6 fixed top-0 bg-background/50 backdrop-blur-lg rounded-b-3xl border-b border-gray-500/10 hidden sm:flex gap-4 z-10"
                style={{ 
                    viewTransitionName: 'nav-bar',
                    height: `${64 + safeArea.top}px`,
                    paddingTop: `${safeArea.top}px`
                }}
            >
                {/* Animated indicator for desktop nav */}
                <div 
                    className="absolute bottom-0 h-0.5 bg-blue-500 rounded-full pointer-events-none z-10"
                    style={{ 
                        ...indicatorStyle, 
                        transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                />
                
                <div className="flex items-center flex-1 justify-start gap-4 lg:gap-8">
                    <TransitionLink href="/" className="flex items-center justify-center" hapticsOnPressRelease={true}>
                        <Image src="/lightLogo.svg" alt="Logo" width={36} height={36} className="hidden light:block"/>
                        <Image src="/darkLogo.svg" alt="Logo" width={36} height={36} className="hidden dark:block"/>
                    </TransitionLink>
                    <TransitionLink 
                        href="/" 
                        className="flex items-center justify-center relative"
                        data-active={isActive("/")}
                        hapticsOnPressRelease={true}
                    >
                        <Button 
                            variant="ghost" 
                            className={cn(
                                "font-light",
                                isActive("/") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: isActive("/") ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <HomeIcon 
                                strokeWidth={isActive("/") ? 2.2 : 1.2} 
                                className="size-4"
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: isActive("/") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            Shop
                        </Button>
                    </TransitionLink>
                    <TransitionLink 
                        href="/trade" 
                        className="flex items-center justify-center relative"
                        data-active={isActive("/trade")}
                        hapticsOnPressRelease={true}
                    >
                        <Button 
                            variant="ghost" 
                            className={cn(
                                "font-light",
                                isActive("/trade") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: isActive("/trade") ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <ArrowRightLeftIcon 
                                strokeWidth={isActive("/trade") ? 2.2 : 1.2} 
                                className="size-4"
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: isActive("/trade") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            Trade
                        </Button>
                    </TransitionLink>
                    <TransitionLink 
                        href="/offers" 
                        className="flex items-center justify-center relative"
                        data-active={isActive("/offers")}
                        hapticsOnPressRelease={true}
                    >
                        <Button 
                            variant="ghost" 
                            className={cn(
                                "font-light",
                                isActive("/offers") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: isActive("/offers") ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <TicketPercentIcon 
                                strokeWidth={isActive("/offers") ? 2.2 : 1.2} 
                                className="size-4"
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: isActive("/offers") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                            Offers
                        </Button>
                    </TransitionLink>
                </div>
                <div className="flex items-center justify-around gap-2">
                    <TransitionLink 
                        href="/products" 
                        className="flex items-center justify-center relative"
                        data-active={isActive("/products")}
                        hapticsOnPressRelease={true}
                    >
                        <Button 
                            variant="ghost" 
                            className={cn(
                                "font-light",
                                isActive("/products") && "text-blue-500"
                            )}
                            size="icon"
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: isActive("/products") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <SearchIcon 
                                strokeWidth={isActive("/products") ? 2.2 : 1.2} 
                                className="size-4"
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: isActive("/products") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                        </Button>
                    </TransitionLink>
                    <TransitionLink 
                        href="/cart" 
                        className="flex items-center justify-center relative"
                        data-active={isActive("/cart")}
                        hapticsOnPressRelease={true}
                    >
                        <Button 
                            variant="ghost" 
                            className={cn(
                                "font-light",
                                isActive("/cart") && "text-blue-500"
                            )}
                            size="icon"
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: isActive("/cart") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <ShoppingCartIcon 
                                strokeWidth={isActive("/cart") ? 2.2 : 1.2} 
                                className="size-4"
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: isActive("/cart") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                        </Button>
                    </TransitionLink>
                    
                    <div className="h-8">
                        <Separator orientation="vertical" className="h-4"/>
                    </div>

                    <ModeToggle />
                    
                    <div className="h-8 ml-1 mx-4">
                        <Separator orientation="vertical" className="h-4"/>
                    </div>
                    
                    <TransitionLink 
                        href="/account" 
                        className="flex items-center justify-center relative"
                        data-active={isActive("/account")}
                        hapticsOnPressRelease={true}
                    >
                        <Button 
                            className={cn(
                                "font-light rounded-xl",
                                isActive("/account") && "bg-blue-500/20"
                            )}
                            size="icon"
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: isActive("/account") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <UserIcon 
                                strokeWidth={isActive("/account") ? 2.2 : 1.5} 
                                className={cn(
                                    "size-4",
                                    isActive("/account") && "text-blue-500"
                                )}
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: isActive("/account") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                        </Button>
                    </TransitionLink>
                </div>
            </nav>
            <nav 
                className="w-full justify-around overflow-hidden px-6 fixed bottom-0 bg-background/50 backdrop-blur-lg rounded-t-3xl border-t border-gray-500/10 flex sm:hidden z-10"
                onTouchEnd={() => setTouchedLink(null)}
                style={{ 
                    viewTransitionName: 'nav-bar-mobile',
                    height: `${64 + safeArea.bottom}px`,
                    paddingBottom: `${safeArea.bottom}px`
                }}
            >
                <TransitionLink 
                    href="/" 
                    className={cn(
                        'size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 relative',
                        isActive("/") && "text-blue-500"
                    )}
                    style={{ 
                        transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                    hapticsOnPressRelease={true}
                    onClick={() => setJustOpenedPage("/")}
                    onTouchStart={() => setTouchedLink("/")}
                    onTouchMove={() => setTouchedLink("/")}
                >
                    {isActive("/") && (
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"
                            style={{ 
                                animation: 'fade-and-scale-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                            }}
                        />
                    )}
                    <div className="size-6">
                            <HomeIcon 
                                strokeWidth={pathname === "/" || justOpenedPage === "/" || touchedLink === "/" ? 2.2 : 1.2} 
                                className={cn(
                                    "size-5.5 md:size-6", 
                                    (pathname === "/" || justOpenedPage === "/"|| touchedLink === "/") && "text-blue-500"
                                )}
                                style={{ 
                                    transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                    transform: (pathname === "/" || justOpenedPage === "/"|| touchedLink === "/") ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />
                    </div>
                    <span 
                        className={cn(
                            "text-[0.60rem] md:text-xs",
                            (pathname === "/" || justOpenedPage === "/"|| touchedLink === "/") && "text-[0px] md:text-[0rem]"
                        )}
                        style={{ 
                            transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                        }}
                    >
                        Home
                    </span>
                </TransitionLink>
                <TransitionLink 
                    href="/products" 
                    className={cn(
                        'size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 relative',
                        isActive("/products") && "text-blue-500"
                    )}
                    style={{ 
                        transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                    hapticsOnPressRelease={true}
                    onClick={() => setJustOpenedPage("/products")}
                    onTouchStart={() => setTouchedLink("/products")}
                    onTouchMove={() => setTouchedLink("/products")}
                >
                    {isActive("/products") && (
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"
                            style={{ 
                                animation: 'fade-and-scale-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                            }}
                        />
                    )}
                    <div className="size-6">
                        <SearchIcon 
                            strokeWidth={pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products" ? 2.2 : 1.2} 
                            className={cn(
                                "size-5.5 md:size-6", 
                                (pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: (pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        />
                    </div>
                    <span 
                        className={cn(
                            "text-[0.60rem] md:text-xs", 
                            (pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products") && "text-[0px] md:text-[0rem]"
                        )}
                        style={{ 
                            transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                        }}
                    >
                        Search
                    </span>
                </TransitionLink>
                <TransitionLink 
                    href="/trade" 
                    className={cn(
                        'size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 relative',
                        isActive("/trade") && "text-blue-500"
                    )}
                    style={{ 
                        transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                    hapticsOnPressRelease={true}
                    onClick={() => setJustOpenedPage("/trade")}
                    onTouchStart={() => setTouchedLink("/trade")}
                    onTouchMove={() => setTouchedLink("/trade")}
                >
                    {isActive("/trade") && (
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"
                            style={{ 
                                animation: 'fade-and-scale-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                            }}
                        />
                    )}
                    <div className="size-6">
                        <ArrowRightLeftIcon 
                            strokeWidth={pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade" ? 2.2 : 1.2} 
                            className={cn(
                                "size-5.5 md:size-6", 
                                (pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: (pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        />
                    </div>
                    <span 
                        className={cn(
                            "text-[0.60rem] md:text-xs", 
                            (pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade") && "text-[0px] md:text-[0rem]"
                        )}
                        style={{ 
                            transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                        }}
                    >
                        Trade in
                    </span>
                </TransitionLink>
                <TransitionLink 
                    href="/cart" 
                    className={cn(
                        'size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 relative',
                        isActive("/cart") && "text-blue-500"
                    )}
                    style={{ 
                        transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                    hapticsOnPressRelease={true}
                    onClick={() => setJustOpenedPage("/cart")}
                    onTouchStart={() => setTouchedLink("/cart")}
                    onTouchMove={() => setTouchedLink("/cart")}
                >
                    {isActive("/cart") && (
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"
                            style={{ 
                                animation: 'fade-and-scale-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                            }}
                        />
                    )}
                    <div className="size-6">
                        <ShoppingCartIcon 
                            strokeWidth={pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart" ? 2.2 : 1.2} 
                            className={cn(
                                "size-5.5 md:size-6", 
                                (pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: (pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        />
                    </div>
                    <span 
                        className={cn(
                            "text-[0.60rem] md:text-xs", 
                            (pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart") && "text-[0px] md:text-[0rem]"
                        )}
                        style={{ 
                            transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                        }}
                    >
                        Cart
                    </span>
                </TransitionLink>

                <TransitionLink 
                    href="/account" 
                    className={cn(
                        'size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 relative',
                        isActive("/account") && "text-blue-500"
                    )}
                    style={{ 
                        transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                    hapticsOnPressRelease={true}
                    onClick={() => setJustOpenedPage("/account")}
                    onTouchStart={() => setTouchedLink("/account")}
                    onTouchMove={() => setTouchedLink("/account")}
                >
                    {isActive("/account") && (
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"
                            style={{ 
                                animation: 'fade-and-scale-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                            }}
                        />
                    )}
                    <div className="size-6">
                        <UserIcon 
                            strokeWidth={pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account" ? 2.2 : 1.2} 
                            className={cn(
                                "size-5.5 md:size-6", 
                                (pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account") && "text-blue-500"
                            )}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
                                transform: (pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account") ? 'scale(1.1)' : 'scale(1)'
                            }}
                        />
                    </div>
                    <span 
                        className={cn(
                            "text-[0.60rem] md:text-xs", 
                            (pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account") && "text-[0px] md:text-[0rem]"
                        )}
                        style={{ 
                            transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)'
                        }}
                    >
                        Account
                    </span>
                </TransitionLink>
            </nav>
            <BottomSafeArea/>
        </>
    )
}