export const metadata = {
  title: 'Privacy Policy',
  description: 'DepxTech Privacy Policy - Learn how we collect, use, and protect your personal information. Effective January 1, 2025.',
  openGraph: {
    title: 'Privacy Policy | DepxTech',
    description: 'DepxTech Privacy Policy - Learn how we collect, use, and protect your personal information.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

            <p className="text-muted-foreground mb-6">Effective Date: January 1, 2025</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                    <p className="mb-4">At DepxTech, we collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Personal Information: Name, email address, shipping address, phone number</li>
                        <li>Payment Information: Credit card details (processed securely through our payment partners)</li>
                        <li>Account Information: Username, password, preferences</li>
                        <li>Transaction Information: Purchase history, trade-in records</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Process your orders and manage your account</li>
                        <li>Communicate with you about products, services, and promotions</li>
                        <li>Improve our products and services</li>
                        <li>Prevent fraud and ensure security</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                    <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To trusted partners who assist us in operating our website and conducting business</li>
                        <li>To comply with law enforcement or legal requirements</li>
                        <li>To protect our rights, property, or safety</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                    <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                    <p className="mb-4">You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Data portability where applicable</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
                    <p className="mb-4">We use cookies and similar technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
                    <p className="mb-4">Our services are not directed to individuals under 13. We do not knowingly collect personal information from children under 13.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
                    <p className="mb-4">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                    <p className="mb-4">If you have questions about this privacy policy, please contact us at:</p>
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