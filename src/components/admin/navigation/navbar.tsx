'use client';

import React from 'react';
import {
    Bell,
    Search,
    LogOut,
    User,
    Settings,
    Newspaper,
    BellOff,
    Menu,
} from 'lucide-react';
import ModeToggle from '@/components/mode-toggle';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
} from '@/components/ui/command';
import { useHotkeys } from 'react-hotkeys-hook';
import { DialogTitle } from '@/components/ui/dialog';

interface NavbarProps {
    sidebarOpen: boolean;
    isMobile: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, isMobile, setSidebarOpen }) => {
    const [commandOpen, setCommandOpen] = React.useState(false);
    const notifications = [
        { id: 1, title: 'New comment', time: '2m ago', read: false },
        { id: 2, title: 'Server error', time: '5m ago', read: false },
        { id: 3, title: 'Deployment success', time: '1h ago', read: true },
    ];

    // Command palette hotkey
    useHotkeys('ctrl+k,cmd+k', (e) => {
        e.preventDefault();
        setCommandOpen(true);
    });

    return (
        <>
            <header
                className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                border-b fixed top-0 right-0 z-20 transition-all duration-200 h-16 left-0
                ${!isMobile && (sidebarOpen ? 'lg:left-64' : 'lg:left-16')}`}
            >
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center flex-1 gap-4">
                        {/* Mobile Menu Toggle */}
                        {isMobile && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        )}

                        {/* Search Bar - Hide on mobile */}
                        <div className="relative w-full max-w-md hidden md:block">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-muted-foreground pl-8"
                                onClick={() => setCommandOpen(true)}
                            >
                                <Search className="absolute left-2.5 h-4 w-4" />
                                <span>Search...</span>
                                <kbd className="pointer-events-none absolute right-2 top-2.5 h-5 select-none rounded border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
                                    ⌘K
                                </kbd>
                            </Button>
                        </div>

                        {/* Mobile Search Icon */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setCommandOpen(true)}
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <ModeToggle />

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative"
                                >
                                    <Bell className="h-5 w-5" />
                                    {notifications.filter((n) => !n.read)
                                        .length > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                                        >
                                            {
                                                notifications.filter(
                                                    (n) => !n.read
                                                ).length
                                            }
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side={isMobile ? "bottom" : "right"}
                                className={isMobile ? "h-[80vh]" : "w-80 sm:w-96"}
                            >
                                <SheetHeader>
                                    <SheetTitle>Notifications</SheetTitle>
                                </SheetHeader>
                                <div className="mt-4 space-y-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-center justify-between p-3 rounded-lg ${
                                                notification.read
                                                    ? 'bg-muted/50'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm font-medium">
                                                    {notification.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {notification.time}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                {notification.read ? (
                                                    <BellOff className="h-4 w-4" />
                                                ) : (
                                                    <Bell className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-9 w-9 rounded-full"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src="/team/gayu.jpg"
                                            alt="Profile"
                                            className="aspect-square object-cover w-full h-full"
                                        />
                                        <AvatarFallback>GA</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                            >
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <div>Goat Admin</div>
                                    {isMobile && (
                                        <Badge variant="outline" className="ml-auto">
                                            Admin
                                        </Badge>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/admin/profile"
                                        className="flex items-center"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/admin/settings"
                                        className="flex items-center"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/"
                                        className="flex items-center"
                                    >
                                        <Newspaper className="mr-2 h-4 w-4" />
                                        <span>Goat News</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <DialogTitle>
                    <CommandInput placeholder="Type a command or search..." />
                </DialogTitle>
                <CommandList className={isMobile ? "h-[60vh]" : ""}>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            {!isMobile && <CommandShortcut>⇧⌘P</CommandShortcut>}
                        </CommandItem>
                        <CommandItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            {!isMobile && <CommandShortcut>⌘S</CommandShortcut>}
                        </CommandItem>
                        <CommandItem>
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notifications</span>
                            {!isMobile && <CommandShortcut>⌘N</CommandShortcut>}
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
};

export default Navbar;
