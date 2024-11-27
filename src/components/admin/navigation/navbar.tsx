'use client';

import React from 'react';
import {
    Search,
    LogOut,
    User,
    Settings,
    Newspaper,
    Menu,
    LayoutDashboard,
} from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import ModeToggle from '@/components/mode-toggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const [commandOpen, setCommandOpen] = React.useState(false);

    useHotkeys('ctrl+k,cmd+k', (e) => {
        e.preventDefault();
        setCommandOpen(true);
    });

    const handleLogout = async () => {
        await signOut();
        router.push('/sign-in');
    };

    const getInitials = () => {
        if (!user?.firstName && !user?.lastName) {
            return user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || '?';
        }
        return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;
    };

    return (
        <>
            <header
                className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                border-b fixed top-0 right-0 z-20 transition-all duration-200 h-16 left-0 flex justify-center px-6
                ${!isMobile && (sidebarOpen ? 'lg:left-64' : 'lg:left-16')}`}
            >
                <div className="flex items-center justify-between h-16 w-full lg:max-w-7xl">
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

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-9 w-9 rounded-full"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                                        <AvatarFallback>{getInitials()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                            >
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {user?.emailAddresses[0]?.emailAddress}
                                        </p>
                                        <Badge variant="outline" className="w-fit mt-1">
                                            Admin
                                        </Badge>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="flex items-center">
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Admin Panel
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings" className="flex items-center">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/" className="flex items-center">
                                            <Newspaper className="w-4 h-4 mr-2" />
                                            Goat News
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 dark:text-red-400"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
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
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                            {!isMobile && <CommandShortcut>⌘D</CommandShortcut>}
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
};

export default Navbar;
