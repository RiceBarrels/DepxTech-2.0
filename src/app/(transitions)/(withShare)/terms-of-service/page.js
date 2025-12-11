export const metadata = {
  title: 'Terms of Service',
  description: 'DepxTech Terms of Service - Read our terms and conditions for using our website and services. Effective January 1, 2025.',
  openGraph: {
    title: 'Terms of Service | DepxTech',
    description: 'DepxTech Terms of Service - Read our terms and conditions for using our website and services.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

            <p className="text-muted-foreground mb-6">Effective Date: January 1, 2025</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4">By accessing and using DepxTech's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Use of Services</h2>
                    <h3 className="text-xl font-semibold mb-2">2.1 Eligibility</h3>
                    <p className="mb-4">You must be at least 13 years old to use our services. By using our services, you represent that you meet this age requirement.</p>

                    <h3 className="text-xl font-semibold mb-2">2.2 Account Registration</h3>
                    <p className="mb-4">You may need to create an account to access certain features. You are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Providing accurate and complete information</li>
                        <li>Maintaining the security of your account credentials</li>
                        <li>All activities that occur under your account</li>
                        <li>Notifying us immediately of any unauthorized use</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Products and Services</h2>
                    <h3 className="text-xl font-semibold mb-2">3.1 Product Descriptions</h3>
                    <p className="mb-4">We strive to provide accurate product descriptions and specifications. However, we do not warrant that descriptions are error-free or complete.</p>

                    <h3 className="text-xl font-semibold mb-2">3.2 Pricing</h3>
                    <p className="mb-4">Prices are subject to change without notice. We reserve the right to modify or discontinue products without prior notice.</p>

                    <h3 className="text-xl font-semibold mb-2">3.3 Availability</h3>
                    <p className="mb-4">Product availability is subject to change. We reserve the right to limit quantities and refuse or cancel orders.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Orders and Payment</h2>
                    <h3 className="text-xl font-semibold mb-2">4.1 Order Acceptance</h3>
                    <p className="mb-4">Your order is an offer to purchase products. We may accept, decline, or limit your order for any reason.</p>

                    <h3 className="text-xl font-semibold mb-2">4.2 Payment Terms</h3>
                    <p className="mb-4">You agree to pay all charges associated with your purchase, including taxes and shipping fees. Payment must be received before order processing.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Trade-In Program</h2>
                    <p className="mb-4">Our trade-in program is subject to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Product condition requirements</li>
                        <li>Verification and inspection processes</li>
                        <li>Value assessments at our discretion</li>
                        <li>Right to refuse any trade-in</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                    <p className="mb-4">All content on our website, including text, graphics, logos, and software, is the property of DepxTech or its licensors and is protected by intellectual property laws.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
                    <p className="mb-4">You agree not to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Use our services for any unlawful purpose</li>
                        <li>Violate any laws or regulations</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Transmit malware or harmful code</li>
                        <li>Interfere with service operations</li>
                        <li>Attempt unauthorized access to systems</li>
                        <li>Engage in fraudulent activities</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
                    <p className="mb-4">Our services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Merchantability</li>
                        <li>Fitness for a particular purpose</li>
                        <li>Non-infringement</li>
                        <li>Accuracy or reliability of information</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                    <p className="mb-4">To the fullest extent permitted by law, DepxTech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
                    <p className="mb-4">You agree to indemnify and hold DepxTech harmless from any claims, damages, losses, and expenses arising from your use of our services or violation of these terms.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                    <p className="mb-4">These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which DepxTech operates, without regard to conflict of law principles.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                    <p className="mb-4">We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of modified terms.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
                    <p className="mb-4">If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
                    <p className="mb-4">For questions about these Terms of Service, please contact us at:</p>
                    <div className="pl-6">
                        <p>Email: support@depxtech.com</p>
                        <p>Phone: Available Mon-Sun 8-22 EDT(NY)</p>
                        <p>Address: DepxTech Inc.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}