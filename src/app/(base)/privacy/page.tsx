import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
    const sections = [
        {
            title: 'Information We Collect',
            content: `We collect information that you provide directly to us, including:
            • Personal information (name, email address, phone number)
            • Account credentials
            • Communication preferences
            • Payment information when you subscribe

            We also automatically collect certain information when you use our website:
            • Log data and device information
            • Cookies and tracking technologies
            • Usage patterns and preferences`,
        },
        {
            title: 'How We Use Your Information',
            content: `We use the information we collect to:
            • Provide and maintain our services
            • Send you updates and news content
            • Process your subscriptions and transactions
            • Respond to your comments and questions
            • Send you technical notices and security alerts
            • Comply with legal obligations`,
        },
        {
            title: 'Information Sharing',
            content: `We may share your information with:
            • Service providers who assist in our operations
            • Professional advisers and auditors
            • Law enforcement when required by law
            • Business partners with your consent

            We do not sell your personal information to third parties.`,
        },
        {
            title: 'Your Rights',
            content: `You have the right to:
            • Access your personal information
            • Correct inaccurate data
            • Request deletion of your data
            • Opt-out of marketing communications
            • Lodge a complaint with supervisory authorities

            Contact us to exercise these rights.`,
        },
        {
            title: 'Data Security',
            content: `We implement appropriate technical and organizational measures to protect your data:
            • Encryption of data in transit and at rest
            • Regular security assessments
            • Access controls and authentication
            • Employee training on data protection
            • Incident response procedures`,
        },
        {
            title: 'Updates to Privacy Policy',
            content: `We may update this Privacy Policy from time to time. We will notify you of any changes by:
            • Posting the new Privacy Policy on this page
            • Updating the "Last Updated" date
            • Sending you an email notification for significant changes

            Your continued use of our services after changes indicates acceptance.`,
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Introduction */}
                <div className="prose dark:prose-invert max-w-none mb-12">
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        At Goat News, we take your privacy seriously. This
                        Privacy Policy explains how we collect, use, disclose,
                        and safeguard your information when you use our website
                        and services. Please read this privacy policy carefully.
                        If you disagree with the terms of this privacy policy,
                        please do not access the site.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-12">
                    {sections.map((section, index) => (
                        <div key={index} className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="px-4 py-1">
                                    {section.title}
                                </Badge>
                                <Separator className="flex-grow bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <div className="pl-4 space-y-4">
                                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-16 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        If you have any questions about this Privacy Policy,
                        please contact us:
                    </p>
                    <div className="space-y-2">
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Email: privacy@goatnews.com
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Address: 123 News Street, Journalism City, 12345
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Phone: (555) 123-4567
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                        ← Back to Goat News
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
