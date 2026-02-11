'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { TransitionLink } from "./pageTransitions";
import { Separator } from "./separator";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';

const linkClass = "block p-4 px-8 hover:bg-accent active:bg-accent focus:bg-accent"

export function Footer(){
    const t = useTranslations('footer')

    return(
        <footer className="mb-24 sm:mb-4 mx-4 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">DepxTech</h1>
            <p className="text-sm text-muted-foreground">
                {t('description')}
            </p>
            <Accordion type="single" collapsible className="w-full border-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger>{t('aboutSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/about" className={linkClass}>{t('aboutUs')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/blog" className={linkClass}>{t('blog')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/deephuo" className={linkClass}>{t('wthIsDeephuo')}</TransitionLink>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>{t('shoppingSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/" className={linkClass}>{t('home')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/products" className={linkClass}>{t('allProducts')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/cart" className={linkClass}>{t('shoppingCart')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/checkout" className={linkClass}>{t('checkout')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/address" className={linkClass}>{t('addressBook')}</TransitionLink>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>{t('tradingSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/trade" className={linkClass}>{t('tradeHub')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/trade" className={linkClass}>{t('tradeGpu')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/trade" className={linkClass}>{t('tradeCpu')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/trade" className={linkClass}>{t('tradeRam')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/refund-policy" className={linkClass}>{t('returnPolicy')}</TransitionLink>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>{t('accountSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/login" className={linkClass}>{t('login')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/signup" className={linkClass}>{t('signUp')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/account" className={linkClass}>{t('myAccount')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/account/orders" className={linkClass}>{t('myOrders')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/account/settings" className={linkClass}>{t('accountSettings')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/account/inbox" className={linkClass}>{t('inbox')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/account/membership" className={linkClass}>{t('membership')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/account/membership/about" className={linkClass}>{t('aboutMembership')}</TransitionLink>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger>{t('helpSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="help" className={linkClass}>{t('helpCenter')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="support" className={linkClass}>{t('chatNow')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <small className={linkClass}>{t('helpHours')}</small>
                        <small className={linkClass}>{t('helpEmail')}</small>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                    <AccordionTrigger>{t('socialsSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="https://www.facebook.com/depxtech" className={linkClass}>{t('facebook')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="https://www.instagram.com/depxtech" className={linkClass}>{t('instagram')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="https://www.youtube.com/@depxtech" className={linkClass}>{t('youtube')}</TransitionLink>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7" className="border-none">
                    <AccordionTrigger>{t('legalSection')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/privacy-policy" className={linkClass}>{t('privacyPolicy')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/terms-of-service" className={linkClass}>{t('termsOfService')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/refund-policy" className={linkClass}>{t('refundPolicy')}</TransitionLink>
                        <div className="px-6"><Separator /></div>
                        <TransitionLink href="/shipping-policy" className={linkClass}>{t('shippingPolicy')}</TransitionLink>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="flex items-center justify-between py-4">
                <small className="text-sm text-muted-foreground">{t('copyright', { year: new Date().getFullYear() })}</small>
                <LanguageSwitcher variant="compact" />
            </div>
        </footer>
    )
}
