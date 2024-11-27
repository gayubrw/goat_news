'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { HomeIcon, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <div
            className="h-screen w-full flex flex-col items-center justify-center relative"
            style={{
                backgroundImage: "url('/goat.png')",
                backgroundSize: '50%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark/Light overlay berdasarkan mode */}
            <div className="absolute inset-0 bg-white/90 dark:bg-black/95" />

            {/* Content dengan warna yang sesuai mode */}
            <div className="text-center space-y-5 relative z-10">
                {/* Error Code & Title */}
                <div className="space-y-2">
                    <h1 className="text-8xl font-bold text-black dark:text-white">
                        404
                    </h1>
                    <h2 className="text-2xl font-semibold text-black dark:text-white">
                        Page Not Found
                    </h2>
                </div>

                {/* Description */}
                <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    Sorry, the page you&apos;re looking for doesn&apos;t exist
                    or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-8">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-transparent dark:text-white border-zinc-200 dark:border-zinc-800"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </Button>

                    <Button
                        onClick={() => router.push('/')}
                        className="gap-2 bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-white/90 dark:text-black"
                    >
                        <HomeIcon size={16} />
                        Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
