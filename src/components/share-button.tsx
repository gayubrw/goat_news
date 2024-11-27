// src/components/share-buttons.tsx
'use client';

import { Share, Twitter, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
    title: string;
    description: string;
}

export function ShareNativeButton({ title, description }: ShareButtonProps) {
    const currentUrl = window.location.href; // Get the current full URL

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title,
                text: description,
                url: currentUrl, // Use the current URL dynamically
            }).catch(() => {
                toast.error("Sharing failed. Your browser might not support this feature.");
            });
        } else {
            toast.error("Sharing is not supported on this device.");
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
            onClick={handleShare}
        >
            <Share className="h-5 w-5" />
            <span className="sr-only">Share</span>
        </Button>
    );
}

export function TwitterShareButton({ title }: Omit<ShareButtonProps, 'description'>) {
    const currentUrl = window.location.href; // Get the current full URL

    const handleTwitterShare = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
            '_blank'
        );
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
            onClick={handleTwitterShare}
        >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Tweet</span>
        </Button>
    );
}

export function CopyLinkButton() {
    const currentUrl = window.location.href; // Get the current full URL

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link.");
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
            onClick={handleCopyLink}
        >
            <LinkIcon className="h-5 w-5" />
            <span className="sr-only">Copy Link</span>
        </Button>
    );
}
