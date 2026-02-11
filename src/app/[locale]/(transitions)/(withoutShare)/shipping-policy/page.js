export async function generateMetadata({ params }) {
  const { getTranslations } = await import('next-intl/server')
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('shippingPolicyTitle'),
    description: t('shippingPolicyDescription'),
    openGraph: { title: t('shippingPolicyTitle'), description: t('shippingPolicyDescription'), type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default function ShippingPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>

            <p className="text-muted-foreground mb-6">Effective Date: January 1, 2025</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Processing Time</h2>
                    <p className="mb-4">Orders are typically processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>In-stock items: 1-2 business days</li>
                        <li>Custom configurations: 3-5 business days</li>
                        <li>Pre-orders: As specified on product page</li>
                        <li>Trade-in orders: 2-3 business days after trade-in verification</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Domestic Shipping (United States)</h2>
                    <h3 className="text-xl font-semibold mb-2">Standard Shipping</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Delivery Time: 5-7 business days</li>
                        <li>Cost: Free for orders over $100, otherwise $9.99</li>
                        <li>Carrier: USPS, UPS Ground, or FedEx Ground</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-2">Express Shipping</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Delivery Time: 2-3 business days</li>
                        <li>Cost: $19.99</li>
                        <li>Carrier: UPS 2-Day or FedEx Express</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-2">Overnight Shipping</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Delivery Time: 1 business day</li>
                        <li>Cost: $39.99</li>
                        <li>Carrier: UPS Next Day Air or FedEx Priority Overnight</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. International Shipping</h2>
                    <p className="mb-4">We ship to select international destinations. International shipping rates and delivery times vary by location.</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Canada: 7-14 business days ($25-50)</li>
                        <li>Europe: 10-20 business days ($40-80)</li>
                        <li>Asia: 14-25 business days ($50-100)</li>
                        <li>Australia: 14-25 business days ($45-90)</li>
                    </ul>
                    <p className="mb-4 font-semibold">Note: International customers are responsible for any customs duties, taxes, or fees.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Shipping Restrictions</h2>
                    <p className="mb-4">We cannot ship to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>P.O. Boxes for high-value items (over $500)</li>
                        <li>APO/FPO addresses for express shipping</li>
                        <li>Countries under trade restrictions</li>
                        <li>Freight forwarding services for warranty items</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Order Tracking</h2>
                    <p className="mb-4">Once your order ships, you will receive a confirmation email with tracking information. You can track your order:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Through your DepxTech account</li>
                        <li>Via the carrier's website using your tracking number</li>
                        <li>By contacting our customer support</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Signature Requirements</h2>
                    <p className="mb-4">Orders over $750 require an adult signature upon delivery. We recommend:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Shipping to a secure location</li>
                        <li>Using a business address if no one is home during the day</li>
                        <li>Authorizing package release with the carrier (at your own risk)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Split Shipments</h2>
                    <p className="mb-4">If your order contains multiple items, they may ship separately to ensure fastest delivery. You will receive separate tracking information for each shipment.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Shipping Damage</h2>
                    <p className="mb-4">If your package arrives damaged:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Document the damage with photos</li>
                        <li>Keep all packaging materials</li>
                        <li>Contact us within 48 hours of delivery</li>
                        <li>We will file a claim with the carrier and send a replacement</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Lost Packages</h2>
                    <p className="mb-4">If your tracking shows delivered but you haven't received your package:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Check with neighbors and building management</li>
                        <li>Verify the shipping address</li>
                        <li>Contact the carrier</li>
                        <li>File a claim with us within 30 days</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Address Changes</h2>
                    <p className="mb-4">To change your shipping address, contact us immediately. We can only modify addresses before the order ships. Once shipped, address changes may incur additional fees from the carrier.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">11. Holiday Shipping</h2>
                    <p className="mb-4">During peak holiday seasons:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Order early to ensure delivery</li>
                        <li>Processing times may be extended</li>
                        <li>Express shipping cutoff dates will be posted</li>
                        <li>Carrier delays may occur</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">12. Environmental Commitment</h2>
                    <p className="mb-4">We are committed to sustainable shipping practices:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Using recycled and recyclable packaging materials</li>
                        <li>Optimizing package sizes to reduce waste</li>
                        <li>Partnering with carriers committed to carbon neutrality</li>
                        <li>Offering consolidated shipping options</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">13. Special Delivery Instructions</h2>
                    <p className="mb-4">You can add special delivery instructions during checkout. Please note that carriers may not always follow these instructions, and we cannot guarantee compliance.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
                    <p className="mb-4">For shipping inquiries:</p>
                    <div className="pl-6">
                        <p>Email: support@depxtech.com</p>
                        <p>Phone: Available Mon-Sun 8-22 EDT(NY)</p>
                        <p>Live Chat: Available on our website</p>
                    </div>
                </section>
            </div>
        </div>
    );
}