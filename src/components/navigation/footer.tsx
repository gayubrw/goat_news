import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const FOOTER_SECTIONS = [
    {
        title: 'Politics',
        path: '/politics',
        links: [
            { href: '/politics/national', label: 'National' },
            { href: '/politics/international', label: 'International' },
        ],
    },
    {
        title: 'Business',
        path: '/business',
        links: [
            { href: '/business/macro', label: 'Macro' },
            {
                href: '/business/financial-exchange',
                label: 'Financial Exchange',
            },
            { href: '/business/real-sector', label: 'Real Sector' },
        ],
    },
    {
        title: 'Tech',
        path: '/tech',
        links: [
            { href: '/tech/gadgets', label: 'Gadgets' },
            { href: '/tech/electronics', label: 'Electronics' },
            { href: '/tech/telco', label: 'Telco' },
        ],
    },
    {
        title: 'Sports',
        path: '/sports',
        links: [
            { href: '/sports/soccer', label: 'Soccer' },
            { href: '/sports/boxing', label: 'Boxing' },
            { href: '/sports/all-sport', label: 'All Sport' },
        ],
    },
    {
        title: 'Entertainment',
        path: '/entertainment',
        links: [
            { href: '/entertainment/movies', label: 'Movies' },
            { href: '/entertainment/music', label: 'Music' },
            { href: '/entertainment/celebrity', label: 'Celebrity' },
        ],
    },
    {
        title: 'Lifestyle',
        path: '/lifestyle',
        links: [
            { href: '/lifestyle/health', label: 'Health' },
            { href: '/lifestyle/travel', label: 'Travel' },
            { href: '/lifestyle/food', label: 'Food' },
        ],
    },
];

const Footer = () => {
    return (
        <footer
            className={cn(
                'relative overflow-hidden',
                'bg-white dark:bg-black',
                'text-zinc-900 dark:text-white',
                'border-t border-border'
            )}
        >
            {/* Main footer content */}
            <div className="relative container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {FOOTER_SECTIONS.map(({ title, path, links }) => (
                        <div key={title} className="space-y-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={path}
                                            className="inline-block"
                                        >
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'px-4 py-1 text-lg font-semibold transition-colors',
                                                    'hover:bg-zinc-200 dark:hover:bg-white/10',
                                                    'border-zinc-300 dark:border-zinc-700'
                                                )}
                                            >
                                                {title}
                                            </Badge>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            View all {title.toLowerCase()} news
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <ul className="space-y-2">
                                {links.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className={cn(
                                                'text-sm transition-colors',
                                                'text-zinc-600 hover:text-zinc-900',
                                                'dark:text-zinc-400 dark:hover:text-white',
                                                'hover:underline underline-offset-4'
                                            )}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-12 bg-zinc-200 dark:bg-white/10" />

                {/* Company info and copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/about"
                            className={cn(
                                'text-sm transition-colors',
                                'text-zinc-600 hover:text-zinc-900',
                                'dark:text-zinc-400 dark:hover:text-white'
                            )}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/privacy"
                            className={cn(
                                'text-sm transition-colors',
                                'text-zinc-600 hover:text-zinc-900',
                                'dark:text-zinc-400 dark:hover:text-white'
                            )}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className={cn(
                                'text-sm transition-colors',
                                'text-zinc-600 hover:text-zinc-900',
                                'dark:text-zinc-400 dark:hover:text-white'
                            )}
                        >
                            Terms of Service
                        </Link>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        © {new Date().getFullYear()} Goat News. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
