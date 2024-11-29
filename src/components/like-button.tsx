"use client"

import React from 'react';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addLike, removeLike } from '@/actions/like';

interface LikeButtonProps {
  newsId: string;
  initialIsLiked?: boolean;
}

const LikeButton = ({ newsId, initialIsLiked = false }: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLikeToggle = async () => {
    try {
      setIsLoading(true);

      if (isLiked) {
        await removeLike(newsId);
        toast({
          description: "Removed from likes",
        });
      } else {
        await addLike(newsId);
        toast({
          description: "Added to likes",
        });
      }

      setIsLiked(!isLiked);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
      onClick={handleLikeToggle}
      disabled={isLoading}
    >
      <Heart
        className={`h-5 w-5 ${isLiked ? 'fill-current text-rose-600 dark:text-rose-400' : ''}`}
      />
      <span className="sr-only">{isLiked ? 'Unlike' : 'Like'}</span>
    </Button>
  );
};

export default LikeButton;
