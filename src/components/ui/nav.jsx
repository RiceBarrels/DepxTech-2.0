"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeIcon, ArrowRightLeftIcon, PaletteIcon, UserIcon, ShoppingCartIcon, TicketPercentIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextSearchIcon } from "lucide-react";
import { SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Separator } from "./separator";
import { ModeToggle } from "./modeToggle";
import { useAuth } from "@/lib/auth";

export default function Nav({}) {
    const { user, loading } = useAuth()
    const pathname = usePathname();
    const [justOpenedPage, setJustOpenedPage] = useState();
    const [touchedLink, setTouchedLink] = useState();

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
            <nav className="w-full h-16 overflow-hidden px-6 fixed top-0 bg-background/50 backdrop-blur-lg rounded-b-3xl border-b border-gray-500/10 hidden sm:flex gap-4">
                <div className="flex items-center flex-1 justify-start gap-4 lg:gap-8">
                    <Link href="/" className="flex items-center justify-center">
                        <Image src="/lightLogo.svg" alt="Logo" width={36} height={36} className="hidden light:block"/>
                        <Image src="/darkLogo.svg" alt="Logo" width={36} height={36} className="hidden dark:block"/>
                    </Link>
                    <Link href="/" className="flex items-center justify-center">
                        <Button variant="ghost" className="font-light"><HomeIcon strokeWidth={1.2} className="size-4"/>Shop</Button>
                    </Link>
                    <Link href="/trade" className="flex items-center justify-center">
                        <Button variant="ghost" className="font-light"><ArrowRightLeftIcon strokeWidth={1.2} className="size-4"/>Trade</Button>
                    </Link>
                    <Link href="/offers" className="flex items-center justify-center">
                        <Button variant="ghost" className="font-light"><TicketPercentIcon strokeWidth={1.2} className="size-4"/>Offers</Button>
                    </Link>
                </div>
                <div className="flex items-center justify-around gap-2">
                    <Link href="/products" className="flex items-center justify-center">
                        <Button variant="ghost" className="font-light" size="icon"><SearchIcon strokeWidth={1.2} className="size-4"/></Button>
                    </Link>
                    <Link href="/cart" className="flex items-center justify-center">
                        <Button variant="ghost" className="font-light" size="icon"><ShoppingCartIcon strokeWidth={1.2} className="size-4"/></Button>
                    </Link>

                    <div className="h-8">
                        <Separator orientation="vertical" className="h-4"/>
                    </div>

                    <ModeToggle />
                    
                    <div className="h-8 ml-1 mx-4">
                        <Separator orientation="vertical" className="h-4"/>
                    </div>
                    
                    <Link href="/account" className="flex items-center justify-center">
                        <Button className="font-light rounded-xl" size="icon"><UserIcon strokeWidth={1.5} className="size-4"/></Button>
                    </Link>
                </div>
            </nav>
            <nav 
                className="w-full justify-around h-16 overflow-hidden px-6 fixed bottom-0 bg-background/50 backdrop-blur-lg rounded-t-3xl border-t border-gray-500/10 flex sm:hidden"
                onTouchEnd={() => setTouchedLink(null)}
            >
                <Link 
                    href="/" 
                    className='size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 transition-all duration-300'
                    onClick={() => setJustOpenedPage("/")}
                    onTouchStart={() => setTouchedLink("/")}
                    onTouchMove={() => setTouchedLink("/")}
                >
                    <div className="size-6">
                            <HomeIcon 
                                strokeWidth={pathname === "/" || justOpenedPage === "/" || touchedLink === "/" ? 2.2 : 1.2} 
                                className={cn("size-5.5 md:size-6 transition-all duration-300 scale-100", (pathname === "/" || justOpenedPage === "/"|| touchedLink === "/") && "text-blue-500 scale-110")}
                            />
                    </div>
                    <span 
                        className={cn("text-[0.60rem] md:text-xs transition-all duration-300", (pathname === "/" || justOpenedPage === "/"|| touchedLink === "/") && "text-[0px] md:text-[0rem]")}
                    >
                        Home
                    </span>
                </Link>
                <Link 
                    href="/products" 
                    className='size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 transition-all duration-300'
                    onClick={() => setJustOpenedPage("/products")}
                    onTouchStart={() => setTouchedLink("/products")}
                    onTouchMove={() => setTouchedLink("/products")}
                >
                    <div className="size-6">
                        <SearchIcon 
                            strokeWidth={pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products" ? 2.2 : 1.2} 
                            className={cn("size-5.5 md:size-6 transition-all duration-300 scale-100", (pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products") && "text-blue-500 scale-110")}
                        />
                    </div>
                    <span 
                        className={cn("text-[0.60rem] md:text-xs transition-all duration-300", (pathname === "/products" || justOpenedPage === "/products" || touchedLink === "/products") && "text-[0px] md:text-[0rem]")}
                    >
                        Search
                    </span>
                </Link>
                <Link 
                    href="/trade" 
                    className='size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 transition-all duration-300'
                    onClick={() => setJustOpenedPage("/trade")}
                    onTouchStart={() => setTouchedLink("/trade")}
                    onTouchMove={() => setTouchedLink("/trade")}
                >
                    <div className="size-6">
                        <ArrowRightLeftIcon strokeWidth={pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade" ? 2.2 : 1.2} className={cn("size-5.5 md:size-6 transition-all duration-300 scale-100", (pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade") && "text-blue-500 scale-110")}/>
                    </div>
                    <span 
                        className={cn("text-[0.60rem] md:text-xs transition-all duration-300", (pathname === "/trade" || justOpenedPage === "/trade" || touchedLink === "/trade") && "text-[0px] md:text-[0rem]")}
                    >
                        Trade in
                    </span>
                </Link>
                <Link 
                    href="/cart" 
                    className='size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 transition-all duration-300'
                    onClick={() => setJustOpenedPage("/cart")}
                    onTouchStart={() => setTouchedLink("/cart")}
                    onTouchMove={() => setTouchedLink("/cart")}
                >
                    <div className="size-6">
                        <ShoppingCartIcon 
                            strokeWidth={pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart" ? 2.2 : 1.2} 
                            className={cn("size-5.5 md:size-6 transition-all duration-300 scale-100", (pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart") && "text-blue-500 scale-110")}
                        />
                    </div>
                    <span 
                        className={cn("text-[0.60rem] md:text-xs transition-all duration-300", (pathname === "/cart" || justOpenedPage === "/cart" || touchedLink === "/cart") && "text-[0px] md:text-[0rem]")}
                    >
                        Cart
                    </span>
                </Link>

                <Link 
                    href="/account" 
                    className='size-16 flex flex-col items-center justify-center md:gap-1 hover:text-blue-500 transition-all duration-300'
                    onClick={() => setJustOpenedPage("/account")}
                    onTouchStart={() => setTouchedLink("/account")}
                    onTouchMove={() => setTouchedLink("/account")}
                >
                    <div className="size-6">
                        <UserIcon 
                            strokeWidth={pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account" ? 2.2 : 1.2} 
                            className={cn("size-5.5 md:size-6 transition-all duration-300 scale-100", (pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account") && "text-blue-500 scale-110")}
                        />
                    </div>
                    <span 
                        className={cn("text-[0.60rem] md:text-xs transition-all duration-300", (pathname === "/account" || justOpenedPage === "/account" || touchedLink === "/account") && "text-[0px] md:text-[0rem]")}
                    >
                        Account
                    </span>
                </Link>
            </nav>
        </>
    )
}