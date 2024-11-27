'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';

const ModeToggle = () => {
    const { setTheme, theme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="relative rounded-full w-fit h-fit p-2"
                >
                    <Sun className="w-[24px] h-[24px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="w-[24px] h-[24px] absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-32">
                <ContextMenuItem onClick={() => setTheme('light')}>
                    Light Mode
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setTheme('dark')}>
                    Dark Mode
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setTheme('system')}>
                    System
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default ModeToggle;
