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
const desktopLinkClass = "text-sm text-muted-foreground hover:text-foreground transition-colors"

export function Footer(){
    const t = useTranslations('footer')

    return(
        <>
            {/* Desktop Footer */}
            <footer className="hidden sm:block border-t bg-muted/30 mt-12">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
                        {/* About */}
                        <div className="col-span-2 md:col-span-4 lg:col-span-2">
                            <h2 className="font-black text-2xl tracking-tight mb-3">DepxTech</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {t('description')}
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <TransitionLink href="https://www.facebook.com/depxtech" className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t('facebook')}</TransitionLink>
                                <TransitionLink href="https://www.instagram.com/depxtech" className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t('instagram')}</TransitionLink>
                                <TransitionLink href="https://www.youtube.com/@depxtech" className="text-muted-foreground hover:text-foreground transition-colors text-sm">{t('youtube')}</TransitionLink>
                            </div>
                        </div>

                        {/* Shopping */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3">{t('shoppingSection')}</h3>
                            <div className="flex flex-col gap-2">
                                <TransitionLink href="/" className={desktopLinkClass}>{t('home')}</TransitionLink>
                                <TransitionLink href="/products" className={desktopLinkClass}>{t('allProducts')}</TransitionLink>
                                <TransitionLink href="/offers" className={desktopLinkClass}>{t('offers')}</TransitionLink>
                                <TransitionLink href="/cart" className={desktopLinkClass}>{t('shoppingCart')}</TransitionLink>
                                <TransitionLink href="/checkout" className={desktopLinkClass}>{t('checkout')}</TransitionLink>
                            </div>
                        </div>

                        {/* Trade-in */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3">{t('tradingSection')}</h3>
                            <div className="flex flex-col gap-2">
                                <TransitionLink href="/trade" className={desktopLinkClass}>{t('tradeHub')}</TransitionLink>
                                <TransitionLink href="/trade/browse" className={desktopLinkClass}>{t('browseDevices')}</TransitionLink>
                                <TransitionLink href="/trade/how-it-works" className={desktopLinkClass}>{t('howItWorks')}</TransitionLink>
                                <TransitionLink href="/trade/process" className={desktopLinkClass}>{t('tradeProcess')}</TransitionLink>
                                <TransitionLink href="/trade/faq" className={desktopLinkClass}>{t('tradeFaq')}</TransitionLink>
                                <TransitionLink href="/trade/sustainability" className={desktopLinkClass}>{t('sustainability')}</TransitionLink>
                            </div>
                        </div>

                        {/* About */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3">{t('aboutSection')}</h3>
                            <div className="flex flex-col gap-2">
                                <TransitionLink href="/about" className={desktopLinkClass}>{t('aboutUs')}</TransitionLink>
                                <TransitionLink href="/blog" className={desktopLinkClass}>{t('blog')}</TransitionLink>
                                <TransitionLink href="/deephuo" className={desktopLinkClass}>{t('wthIsDeephuo')}</TransitionLink>
                            </div>
                        </div>

                        {/* Account */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3">{t('accountSection')}</h3>
                            <div className="flex flex-col gap-2">
                                <TransitionLink href="/login" className={desktopLinkClass}>{t('login')}</TransitionLink>
                                <TransitionLink href="/signup" className={desktopLinkClass}>{t('signUp')}</TransitionLink>
                                <TransitionLink href="/account" className={desktopLinkClass}>{t('myAccount')}</TransitionLink>
                                <TransitionLink href="/account/orders" className={desktopLinkClass}>{t('myOrders')}</TransitionLink>
                                <TransitionLink href="/account/trade-ins" className={desktopLinkClass}>{t('myTradeIns')}</TransitionLink>
                                <TransitionLink href="/account/settings" className={desktopLinkClass}>{t('accountSettings')}</TransitionLink>
                            </div>
                        </div>

                        {/* Help & Info */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3">{t('helpSection')}</h3>
                            <div className="flex flex-col gap-2">
                                <TransitionLink href="/help" className={desktopLinkClass}>{t('helpCenter')}</TransitionLink>
                                <TransitionLink href="/support" className={desktopLinkClass}>{t('chatNow')}</TransitionLink>
                                <TransitionLink href="/shipping" className={desktopLinkClass}>{t('shippingInfo')}</TransitionLink>
                                <TransitionLink href="/warranty" className={desktopLinkClass}>{t('warranty')}</TransitionLink>
                                <TransitionLink href="/returns" className={desktopLinkClass}>{t('returns')}</TransitionLink>
                                <span className="text-xs text-muted-foreground">{t('helpHours')}</span>
                                <span className="text-xs text-muted-foreground">{t('helpEmail')}</span>
                            </div>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3">{t('legalSection')}</h3>
                            <div className="flex flex-col gap-2">
                                <TransitionLink href="/privacy-policy" className={desktopLinkClass}>{t('privacyPolicy')}</TransitionLink>
                                <TransitionLink href="/terms-of-service" className={desktopLinkClass}>{t('termsOfService')}</TransitionLink>
                                <TransitionLink href="/refund-policy" className={desktopLinkClass}>{t('refundPolicy')}</TransitionLink>
                                <TransitionLink href="/shipping-policy" className={desktopLinkClass}>{t('shippingPolicy')}</TransitionLink>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="flex items-center justify-between">
                        <small className="text-sm text-muted-foreground">{t('copyright', { year: new Date().getFullYear() })}</small>
                        <LanguageSwitcher variant="compact" />
                    </div>
                </div>
            </footer>

            {/* Mobile Footer - Accordion */}
            <footer className="sm:hidden mb-24 mx-4 flex flex-col gap-4">
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
                            <TransitionLink href="/offers" className={linkClass}>{t('offers')}</TransitionLink>
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
                            <TransitionLink href="/trade/browse" className={linkClass}>{t('browseDevices')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/trade/how-it-works" className={linkClass}>{t('howItWorks')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/trade/process" className={linkClass}>{t('tradeProcess')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/trade/faq" className={linkClass}>{t('tradeFaq')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/trade/sustainability" className={linkClass}>{t('sustainability')}</TransitionLink>
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
                            <TransitionLink href="/account/trade-ins" className={linkClass}>{t('myTradeIns')}</TransitionLink>
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
                            <TransitionLink href="/help" className={linkClass}>{t('helpCenter')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/support" className={linkClass}>{t('chatNow')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/shipping" className={linkClass}>{t('shippingInfo')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/warranty" className={linkClass}>{t('warranty')}</TransitionLink>
                            <div className="px-6"><Separator /></div>
                            <TransitionLink href="/returns" className={linkClass}>{t('returns')}</TransitionLink>
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
        </>
    )
}
