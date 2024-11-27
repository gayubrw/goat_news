'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    Layers,
    FolderTree,
    MessageSquare,
    ThumbsUp,
    Bookmark,
    BarChart,
    Shield,
    X,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    isMobile: boolean;
}

interface NavSection {
    title: string;
    items: {
        icon: React.ElementType;
        label: string;
        href: string;
    }[];
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
    const pathname = usePathname();

    const navSections: NavSection[] = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
            ],
        },
        {
            title: 'Content Management',
            items: [
                { icon: FileText, label: 'News', href: '/admin/news' },
                { icon: Layers, label: 'Categories', href: '/admin/categories' },
                {
                    icon: FolderTree,
                    label: 'Subcategories',
                    href: '/admin/subcategories',
                },
            ],
        },
        {
            title: 'User Engagement',
            items: [
                { icon: Users, label: 'Users', href: '/admin/users' },
                { icon: Shield, label: 'Roles', href: '/admin/roles' },
                {
                    icon: MessageSquare,
                    label: 'Comments',
                    href: '/admin/comments',
                },
                { icon: ThumbsUp, label: 'Likes', href: '/admin/likes' },
                {
                    icon: Bookmark,
                    label: 'Bookmarks',
                    href: '/admin/bookmarks',
                },
                {
                    icon: BarChart,
                    label: 'Interactions',
                    href: '/admin/interactions',
                },
            ],
        },
        {
            title: 'System',
            items: [
                {
                    icon: Settings,
                    label: 'Settings',
                    href: '/admin/settings',
                },
            ],
        },
    ];

    const isActiveLink = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname?.startsWith(href);
    };

    // Base sidebar classes
    const sidebarClasses = cn(
        'fixed top-0 z-30 h-full border-r bg-background transition-all duration-200',
        {
            // Mobile styles
            'left-0 w-64': isMobile && sidebarOpen,
            '-left-64': isMobile && !sidebarOpen,
            // Desktop styles
            'w-64': !isMobile && sidebarOpen,
            'w-16': !isMobile && !sidebarOpen,
        }
    );

    return (
        <div className={sidebarClasses}>
            <div className="flex h-16 items-center justify-between border-b px-4 overflow-x-hidden">
                <h1
                    className={cn(
                        'font-semibold text-xl',
                        (!sidebarOpen && !isMobile) && 'hidden'
                    )}
                >
                    Admin Panel
                </h1>
                <div
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className='p-2 rounded hover:bg-accent hover:text-accent-foreground hover:cursor-pointer'
                >
                    {isMobile && sidebarOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-4rem)]">
                <nav className="space-y-2 py-4 px-4">
                    {navSections.map((section, idx) => (
                        <div key={section.title} className="space-y-2">
                            {idx > 0 && <Separator className="my-4" />}
                            {(sidebarOpen || isMobile) && (
                                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                                    {section.title}
                                </h2>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => (
                                    (!sidebarOpen && !isMobile) ? (
                                        <TooltipProvider key={itemIdx}>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            'flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors',
                                                            isActiveLink(item.href)
                                                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                                                : 'hover:bg-accent hover:text-accent-foreground'
                                                        )}
                                                    >
                                                        <item.icon className="h-5 w-5" />
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    {item.label}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <Link
                                            key={itemIdx}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors',
                                                isActiveLink(item.href)
                                                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                                    : 'hover:bg-accent hover:text-accent-foreground'
                                            )}
                                            onClick={() => {
                                                if (isMobile) {
                                                    setSidebarOpen(false);
                                                }
                                            }}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </ScrollArea>
        </div>
    );
};

export default Sidebar;
