"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getCategories } from '@/actions/category';
import type { Category } from '@/types';

const Footer = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                if (data) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <footer className={cn(
            'relative overflow-hidden',
            'bg-white dark:bg-black',
            'text-zinc-900 dark:text-white',
            'border-t border-border'
        )}>
            <div className="relative container mx-auto px-6 py-12">
                {isLoading ? (
                    // Loading skeleton with column layout
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-8">
                        {[...Array(7)].map((_, index) => (
                            <div key={index} className="space-y-6">
                                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                                <div className="space-y-4">
                                    {[...Array(6)].map((_, idx) => (
                                        <div key={idx} className="h-4 w-20 bg-muted animate-pulse rounded" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-8">
                        {categories.map((category) => (
                            <div key={category.id} className="flex flex-col">
                                <Link 
                                    href={`/${category.path}`}
                                    className={cn(
                                        'text-base font-semibold mb-4',
                                        'text-zinc-900 dark:text-white',
                                        'hover:text-zinc-700 dark:hover:text-zinc-300',
                                        'transition-colors duration-200'
                                    )}
                                >
                                    {category.title}
                                </Link>
                                <ul className="space-y-3">
                                    {category.subCategories.map((subCategory) => (
                                        <li key={subCategory.id}>
                                            <Link
                                                href={`/${category.path}/${subCategory.path}`}
                                                className={cn(
                                                    'text-sm block',
                                                    'text-zinc-600 hover:text-zinc-900',
                                                    'dark:text-zinc-400 dark:hover:text-white',
                                                    'transition-colors duration-200'
                                                )}
                                            >
                                                {subCategory.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                <Separator className="my-10 bg-zinc-200 dark:bg-zinc-800" />

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
                        © {new Date().getFullYear()} Goat News. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;