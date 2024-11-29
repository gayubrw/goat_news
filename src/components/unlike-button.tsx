'use client';

import React from 'react';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { removeLike } from '@/actions/like';

interface UnlikeButtonProps {
  newsId: string;
}

export function UnlikeButton({ newsId }: UnlikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUnlike = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      await removeLike(newsId);
      toast({
        description: "Removed from likes"
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove like",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-500 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
      onClick={handleUnlike}
      disabled={isLoading}
    >
      <Heart className="h-5 w-5 fill-current" />
      <span className="sr-only">Unlike</span>
    </Button>
  );
}
