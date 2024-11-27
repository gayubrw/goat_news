import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TermsOfService = () => {
    const sections = [
        {
            title: 'Acceptance of Terms',
            content: `By accessing or using Goat News, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our service.

            These terms apply to all users, visitors, and others who access or use Goat News services.`,
        },
        {
            title: 'Account Registration',
            content: `When creating an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.

            You are responsible for:
            • Safeguarding your account password
            • All activities that occur under your account
            • Notifying us immediately of any unauthorized access

            We reserve the right to disable any user account at any time.`,
        },
        {
            title: 'Content and Services',
            content: `Our service provides news, articles, and related content. We reserve the right to:
            • Modify or discontinue any part of our services
            • Refuse service to anyone for any reason
            • Remove content that violates our policies

            All content published on Goat News is protected by copyright and other intellectual property rights.`,
        },
        {
            title: 'User Conduct',
            content: `You agree not to:
            • Use our service for any illegal purposes
            • Post unauthorized commercial communications
            • Engage in unauthorized data collection
            • Upload malicious code or content
            • Interfere with the proper working of the service
            • Create multiple accounts for misleading purposes

            Violation of these rules may result in account termination.`,
        },
        {
            title: 'Subscription and Payments',
            content: `For premium services:
            • Payments are processed securely through our payment providers
            • Subscriptions auto-renew unless cancelled
            • Refunds are handled according to our refund policy
            • Prices may change with notice

            You are responsible for all applicable taxes and fees.`,
        },
        {
            title: 'Limitation of Liability',
            content: `Goat News and its affiliates shall not be liable for:
            • Indirect, incidental, special, or consequential damages
            • Loss of profits, data, or business opportunities
            • Service interruptions or data loss
            • Actions of third parties

            Our liability is limited to the maximum extent permitted by law.`,
        },
        {
            title: 'Termination',
            content: `We may terminate or suspend access to our service immediately, without prior notice, for:
            • Breach of Terms of Service
            • Harmful conduct to other users
            • Violation of applicable laws
            • At our sole discretion

            All provisions of the Terms shall survive termination.`,
        },
        {
            title: 'Changes to Terms',
            content: `We reserve the right to modify these terms at any time. We will notify users of any changes by:
            • Posting the updated terms on this page
            • Updating the "Last Modified" date
            • Sending a notification when significant changes are made

            Your continued use of the service constitutes acceptance of the changes.`,
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Last Modified: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Introduction */}
                <div className="prose dark:prose-invert max-w-none mb-12">
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Welcome to Goat News. These Terms of Service govern your
                        access to and use of our website, services, and content.
                        Please read these Terms carefully before using our
                        services.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-12">
                    {sections.map((section, index) => (
                        <div key={index} className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Badge
                                    variant="outline"
                                    className="px-4 py-1 text-base whitespace-nowrap"
                                >
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
                    <h2 className="text-xl font-semibold mb-4">
                        Questions or Concerns?
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        If you have any questions about these Terms of Service,
                        please contact us:
                    </p>
                    <div className="space-y-2">
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Email: legal@goatnews.com
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

export default TermsOfService;
