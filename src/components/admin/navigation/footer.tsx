'use client';

import React from 'react';
import { Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
    sidebarOpen: boolean;
    isMobile: boolean;
}

const Footer: React.FC<FooterProps> = ({ sidebarOpen, isMobile }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className={`
                fixed bottom-0 right-0 left-0 z-10
                bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                border-t
                transition-all duration-200
                ${!isMobile && (sidebarOpen ? 'lg:left-64' : 'lg:left-16')}
            `}
        >
            <div className="container mx-auto px-2 py-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span className="text-xs md:text-sm text-center md:text-left text-muted-foreground">
                            © {currentYear} Goat News Admin. All rights
                            reserved.
                        </span>
                        <div className="hidden md:flex items-center gap-4">
                            <Separator orientation="vertical" className="h-4" />
                            <Button
                                variant="link"
                                className="text-sm h-auto p-0"
                            >
                                Privacy Policy
                            </Button>
                            <Button
                                variant="link"
                                className="text-sm h-auto p-0"
                            >
                                Terms of Service
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {!isMobile && (
                            <>
                                <span className="text-sm text-muted-foreground">
                                    v1.0.0
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                            </>
                        )}
                        <div className="flex items-center gap-1 md:gap-2">
                            <Button
                                variant="ghost"
                                size={isMobile ? "sm" : "icon"}
                                className="h-8 w-8 md:h-10 md:w-10"
                                asChild
                            >
                                <a href="#" aria-label="Github">
                                    <Github className="h-4 w-4 md:h-5 md:w-5" />
                                </a>
                            </Button>
                            <Button
                                variant="ghost"
                                size={isMobile ? "sm" : "icon"}
                                className="h-8 w-8 md:h-10 md:w-10"
                                asChild
                            >
                                <a href="#" aria-label="Twitter">
                                    <Twitter className="h-4 w-4 md:h-5 md:w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
