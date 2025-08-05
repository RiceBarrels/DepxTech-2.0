import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader } from "./card";
import { ForwardLink } from "./pageTransitions";
import Link from "next/link";
import { Separator } from "./separator";

export function Footer(){
    return(
        <footer className="mb-24 sm:mb-4 mx-4 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">DepxTech</h1>
            <p className="text-sm text-muted-foreground">
                DepxTech is a technology company that provides a range of products and services to the public.
            </p>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="">
                    <AccordionTrigger className="">About DepxTech</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="about" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">About Us</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="blog" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Blog</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="deephuo" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">WTH is DeepHuo?</Link>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="">
                    <AccordionTrigger className="">Shopping & Products</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="/" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Home</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/products" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">All Products</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/cart" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Shopping Cart</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/checkout" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Checkout</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/address" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Address Book</Link>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="">
                    <AccordionTrigger className="">Trading</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="/trade" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Trade Hub</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/trade" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Trade GPU</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/trade" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Trade CPU</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/trade" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Trade RAM</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/refund-policy" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Return Policy</Link>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="">
                    <AccordionTrigger className="">Account</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="/login" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Login</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/signup" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Sign Up</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/account" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">My Account</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/account/orders" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">My Orders</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/account/settings" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Account Settings</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/account/inbox" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Inbox</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/account/membership" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Membership</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/account/membership/about" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">About Membership</Link>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="">
                    <AccordionTrigger className="">Help</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="help" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Help Center</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="support" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Chat Now</Link>
                        <div className="px-6"><Separator /></div>
                        <small className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Mon-Sun 8-22 EDT(NY)</small>
                        <small className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Email: support@depxtech.com</small>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6" className="">
                    <AccordionTrigger className="">Socials</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="https://www.facebook.com/depxtech" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Facebook</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="https://www.instagram.com/depxtech" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Instagram</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="https://www.youtube.com/@depxtech" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Youtube</Link>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7" className="border-none ">
                    <AccordionTrigger className="">Terms & Conditions & Privacy Policy</AccordionTrigger>
                    <AccordionContent className="">
                        <div className="px-6"><Separator /></div>
                        <Link href="/privacy-policy" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Privacy Policy</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/terms-of-service" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Terms of Service</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/refund-policy" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Refund Policy</Link>
                        <div className="px-6"><Separator /></div>
                        <Link href="/shipping-policy" className="block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent">Shipping Policy</Link>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <small className="text-sm text-muted-foreground text-center py-4">Copyright © 2025 DepxTech. All rights reserved.</small>
        </footer>
    )
}