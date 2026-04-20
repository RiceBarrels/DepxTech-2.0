export async function generateMetadata({ params }) {
  const { getTranslations } = await import('next-intl/server')
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('refundTitle'),
    description: t('refundDescription'),
    openGraph: { title: t('refundTitle'), description: t('refundDescription'), type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default function RefundPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Refund & Return Policy</h1>

            <p className="text-muted-foreground mb-6">Effective Date: January 1, 2025</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Return Period</h2>
                    <p className="mb-4">We offer a 30-day return window for most products purchased from DepxTech. The return period begins on the date of delivery.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Eligibility for Returns</h2>
                    <p className="mb-4">To be eligible for a return, items must be:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>In original condition with all original packaging</li>
                        <li>Unused and undamaged</li>
                        <li>Accompanied by proof of purchase</li>
                        <li>Include all accessories, manuals, and documentation</li>
                        <li>Free from any physical damage caused by misuse</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Non-Returnable Items</h2>
                    <p className="mb-4">The following items cannot be returned:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Custom-configured or personalized products</li>
                        <li>Products marked as final sale</li>
                        <li>Opened software or digital products</li>
                        <li>Items damaged due to customer negligence</li>
                        <li>Products without original packaging or tags</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Return Process</h2>
                    <h3 className="text-xl font-semibold mb-2">Step 1: Initiate Return</h3>
                    <p className="mb-4">Contact our customer support team at support@depxtech.com or through your account to initiate a return request.</p>

                    <h3 className="text-xl font-semibold mb-2">Step 2: Receive RMA Number</h3>
                    <p className="mb-4">Once approved, you will receive a Return Merchandise Authorization (RMA) number and return shipping instructions.</p>

                    <h3 className="text-xl font-semibold mb-2">Step 3: Ship the Item</h3>
                    <p className="mb-4">Package the item securely and ship it to our returns center with the RMA number clearly marked on the outside of the package.</p>

                    <h3 className="text-xl font-semibold mb-2">Step 4: Processing</h3>
                    <p className="mb-4">Once we receive your return, we will inspect it and process your refund or exchange within 5-7 business days.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Refund Methods</h2>
                    <p className="mb-4">Refunds will be issued to the original payment method:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Credit/Debit Card: 5-10 business days</li>
                        <li>PayPal: 3-5 business days</li>
                        <li>Store Credit: Immediate</li>
                        <li>Bank Transfer: 7-10 business days</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Exchanges</h2>
                    <p className="mb-4">If you need to exchange an item for the same product due to defect or damage, we will arrange for a replacement to be sent once the original item is received and inspected.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Defective or Damaged Items</h2>
                    <p className="mb-4">For items that arrive defective or damaged:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Report the issue within 48 hours of delivery</li>
                        <li>Provide photos of the damage</li>
                        <li>We will arrange for a prepaid return label</li>
                        <li>Full refund or replacement will be provided</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Return Shipping Costs</h2>
                    <h3 className="text-xl font-semibold mb-2">Customer-Initiated Returns</h3>
                    <p className="mb-4">Customers are responsible for return shipping costs unless the item is defective or we made an error.</p>

                    <h3 className="text-xl font-semibold mb-2">DepxTech Errors</h3>
                    <p className="mb-4">We cover return shipping costs if:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Wrong item was sent</li>
                        <li>Item arrived damaged or defective</li>
                        <li>Item doesn't match description</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Restocking Fees</h2>
                    <p className="mb-4">A restocking fee of up to 15% may apply for:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>High-value electronics returned after 15 days</li>
                        <li>Items returned without original packaging</li>
                        <li>Special order items</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Trade-In Returns</h2>
                    <p className="mb-4">Items accepted through our trade-in program are final and cannot be returned. All trade-in values are final once accepted.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">11. International Returns</h2>
                    <p className="mb-4">International customers are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>All return shipping costs</li>
                        <li>Any customs or import duties</li>
                        <li>Compliance with export regulations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">12. Warranty Claims</h2>
                    <p className="mb-4">Products under manufacturer warranty should be handled according to the warranty terms. Contact us for assistance with warranty claims.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
                    <p className="mb-4">For questions about returns and refunds:</p>
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